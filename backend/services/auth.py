from fastapi import HTTPException,status
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from constants.provider import AuthProviders
from utils.password import hashPassword,verifyPassword
from database.mongoDB.actions.auth import AuthActions,TokensActions
from core.config import settings
from utils.authentication import create_refresh_token,create_token,verify_token
# from utils.otp_actions import verifyOtp,send_otp_email  #this one is the real otp logic
from utils.test_email import send_otp_email,verifyOtp
import httpx


class AuthService:
    def __init__(self):
        self.AuthActions=AuthActions()
        self.TokenActions=TokensActions()

    async def _issue_tokens(self,user_id: ObjectId):
        existing = await self.TokenActions.get_by_filter(
            {"user_id": user_id},
            {"_id": 1}
        )
        if existing:
            await self.TokenActions.hard_delete(id=existing["_id"])

        access_token = create_token({"sub": str(user_id)})
        refresh_token = create_refresh_token({"sub": str(user_id)})
        data={
            "user_id": user_id,
            "refresh_token": refresh_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=5)
        }
        await self.TokenActions.create(data)
        # await self.TokenActions.store_refresh_token({
        #     "user_id": user_id,
        #     "refresh_token": refresh_token,
        #     "created_at": datetime.now(timezone.utc),
        #     "expires_at": datetime.now(timezone.utc) + timedelta(days=5)
        # })

        return access_token, refresh_token
    
    async def registerUser(self, userData: dict):
        userData.setdefault("profile_pic", "https://terpdfhqqmambcxoyrxn.supabase.co/storage/v1/object/public/profile_pics/default_profile_pics/default_pic.png")
        userData.setdefault("bio", "Hey there! I'm using MastMeme 😎")
        userData.setdefault("provider", AuthProviders.PROVIDER_EMAIL)
        userData.setdefault("is_verified", False)

        existing = await self.AuthActions.find_by_email(
            {"email": userData["email"]},
            {"_id":1, "provider":1, "is_verified":1, "is_deleted":1}
        )

        if existing:
            if existing["is_deleted"]:
                await self.AuthActions.hard_delete(existing["_id"])

            elif existing["provider"] == AuthProviders.PROVIDER_EMAIL and not existing["is_verified"]:
                await self.AuthActions.hard_delete(existing["_id"])

            elif existing["provider"] == AuthProviders.PROVIDER_GOOGLE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email is already registered using Google. Please continue with Google."
                )

            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User is already registered with this"
                )

        userData["password"] = hashPassword(userData.get("password"))
        return await self.AuthActions.create(userData)
    
    async def sendOtp(self,email:str):
        user=await self.AuthActions.get_by_filter({"email":email,"provider":AuthProviders.PROVIDER_EMAIL},{"email":1,"is_verified":1})
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        
        if user["is_verified"] is True:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="User is already verified")

        generated_otp=await send_otp_email(email)

        return {"otp": generated_otp} # for testing
    
    async def verifyOtp(self,email:str,otp:str):
        user=await self.AuthActions.get_by_filter({"email":email,"provider":AuthProviders.PROVIDER_EMAIL},{"email":1,"is_verified":1})#is deleted is handle in action layer
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        
        if user["is_verified"] is True:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="User is already verified")
        
        data=await verifyOtp(email,otp)
        if data:
            await self.AuthActions.updated(user["_id"],{"is_verified": True})

    async def loginUser(self,loginData:dict):

        user=await self.AuthActions.get_by_filter({"email":loginData.get("email"),"is_verified":True},{"password":1,"provider":1})
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Credentials")
        
        if user["provider"]==AuthProviders.PROVIDER_GOOGLE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="This account was created using Google. Please continue with Google.")
        
        if user and not verifyPassword(loginData.get("password"),user.get("password")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invlaid credentials")
        
        return await self._issue_tokens(user["_id"])
    
    async def refreshToken(self,refresh_token):
        user_id= verify_token(refresh_token,is_refresh=True)
        stored_token=await self.TokenActions.get_by_filter({"user_id":ObjectId(user_id),"refresh_token":refresh_token},{"refresh_token": 1})
        if stored_token is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid refresh token")
        if refresh_token!=stored_token["refresh_token"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Inavlid refresh token")
        return await self._issue_tokens(ObjectId(user_id))
    
    async def logout(self,id:str):
        await self.TokenActions.hard_delete(filter={"user_id":ObjectId(id)})

    #this function is for logged in user
    async def changePassword(self,user_id:str,new_password:str,retype_password:str):
        if new_password!=retype_password:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="password not match")
        
        await self.TokenActions.hard_delete(filter={"user_id": ObjectId(user_id)})
        hash_password=hashPassword(new_password)
        await self.AuthActions.updated(user_id,{"password":hash_password})

    async def google_auth(self,id_token:str):
        async with httpx.AsyncClient() as client:
            verify = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token}
            )

        if verify.status_code != 200:
            raise HTTPException(401, "Invalid Google token")
    
        google_user = verify.json()
        client_id=settings.GOOGLE_CLIENT_ID
        if google_user.get("aud") != client_id:
            raise HTTPException(status_code=400, detail="Invalid Google token audience")
        
        if not google_user.get("email_verified"):
            raise HTTPException(400, "Email not verified")
        
        email = google_user["email"]
        google_id = google_user["sub"]
        name = google_user.get("name")
        picture = google_user.get("picture")

        existing = await self.AuthActions.find_by_email(
            {"email": email},
            {"_id": 1,"is_verified":1,"is_deleted":1,"provider":1}
        )
        
        if existing:
            if existing["is_deleted"] is True:
                await self.AuthActions.hard_delete(existing["_id"])

            if existing["is_verified"] is False:
                await self.AuthActions.hard_delete(existing["_id"])

            if existing["provider"]==AuthProviders.PROVIDER_GOOGLE:
                id=existing["_id"]
                return await self._issue_tokens(id)
            
            if existing["provider"]==AuthProviders.PROVIDER_EMAIL:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="you have already registered with email/pass login with email/pass")

        new_user_data = {
            "user_name": name,
            "email": email,
            "password":None,
            "google_id": google_id,
            "profile_pic": picture,
            "bio": "Hey there! I'm using MastMeme 😎",
            "provider": AuthProviders.PROVIDER_GOOGLE,
            "is_verified": True
        }

        new_user = await self.AuthActions.create(new_user_data)
        id = new_user["_id"]
        return await self._issue_tokens(id)
    
        






        