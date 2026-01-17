from fastapi import APIRouter,status,Depends,Response,Cookie
from models.response.auth import RegisterResponse,OtpResponse,TokenResponse
from models.request.auth import RegisterUser,LoginUser,Otp,verifyData,RefreshToken,ChangePassword,GoogleAuthRequest
from services.auth import AuthService
from dependency.auth_dependency import get_current_user


route=APIRouter()
service=AuthService()

@route.post("/register",status_code=status.HTTP_201_CREATED,response_model=RegisterResponse)
async def register(userdata:RegisterUser):
    user=await service.registerUser(userdata.model_dump())
    return RegisterResponse(**user)
    
@route.post("/send-otp",status_code=status.HTTP_200_OK,response_model=OtpResponse)
async def sendOtp(data:Otp):
    otp=await service.sendOtp(data.email)
    return OtpResponse(**otp)
    
@route.post("/verify-otp",status_code=status.HTTP_200_OK)
async def verifyOtp(data:verifyData):
    await service.verifyOtp(data.email,data.otp)
    return {"message":"user verified succesffully"}
    
@route.post("/login",status_code=status.HTTP_200_OK,response_model=TokenResponse)
async def login(loginData:LoginUser,response: Response):
    access_token,refresh_token=await service.loginUser(loginData.model_dump())
    response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,     
            samesite="lax",
            max_age=60 * 60 * 24 * 5,
    )
    return TokenResponse(access_token=access_token)

@route.post("/refresh",status_code=status.HTTP_200_OK,response_model=TokenResponse)
async def refreshToken(response: Response,refresh_token: str | None = Cookie(default=None, alias="refresh_token")):
    access_token,refresh_token=await service.refreshToken(refresh_token)
    response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,     
            samesite="lax",
            max_age=60 * 60 * 24 * 5
    )
    return TokenResponse(access_token=access_token)
    
@route.delete("/logout",status_code=status.HTTP_204_NO_CONTENT)
async def logut(current_user=Depends(get_current_user)):
    await service.logout(current_user["_id"])

@route.patch("/change-password",status_code=status.HTTP_201_CREATED)
async def changePassword(changePassword:ChangePassword,current_user=Depends(get_current_user)):
    await service.changePassword(current_user["_id"],changePassword.new_password,changePassword.retype_password)
    return {"message":"password change"}


@route.post("/google",status_code=status.HTTP_200_OK,response_model=TokenResponse)
async def google_auth(response: Response,data: GoogleAuthRequest):
    access_token,refresh_token=await service.google_auth(data.token_id)
    response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,     
            samesite="lax",
            max_age=60 * 60 * 24 * 5
    )
    return TokenResponse(access_token=access_token,)



