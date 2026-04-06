from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.user import UserActions
from fastapi import HTTPException,status
from database.mongoDB.actions.user import FollowActions,ReportActions,TopUsers
from utils.upload_to_bucket import upload_to_bucket
from core.config import settings
class UserService:
    def __init__(self):
        self.user_actions=UserActions()
        self.follow_actions=FollowActions()
        self.report_actions=ReportActions()
        self.top_users=TopUsers()

    async def getAllUsers(self):
        return await self.user_actions.get_user_with_details()
    
    async def search_users(self, query: str):

        if not query:
            return []
        projection = {"user_name": 1,"profile_pic":1}

        users = await self.user_actions.get_all(
            {"user_name": {"$regex": query, "$options": "i"}},
            projection=projection
        )
        return users

    async def getCurrentUser(self,user_id:str):
        return await self.user_actions.get_user_with_details(user_id)
    
    async def get_user_by_id(self,user_id:str,current_user:str):
        self.user_actions.validate_object_id(user_id)
        data=await self.user_actions.get_user_with_details(user_id,current_user)
        
        if data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        return data
    
    async def upadteUser(self,current_user_id:str,data:dict):
        await self.user_actions.updated(current_user_id,data)

    async def updateProfilePic(self,current_user_id:str, profile_pic):
        
        file_ext = profile_pic.filename.split(".")[-1].lower()
        url = await upload_to_bucket(
            bucket=settings.PROFILE_PICS_BUCKET,
            file=profile_pic,
            file_ext=file_ext
        )
        await self.user_actions.updated(current_user_id, {"profile_pic": url})
        return url

    
    async def follow(self,to_follow:str,by_follow:str):
        self.follow_actions.validate_object_id(to_follow)
        if(str(to_follow)==str(by_follow)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="you cannot follow yourself")
        user=await self.user_actions.get_data_by_id(to_follow)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        action=await self.follow_actions.follow(to_follow,by_follow)
        return action
    
    async def get_followers(self,**kwargs):
        return await self.follow_actions.get_follow_data(**kwargs)

    async def get_followings(self,**kwargs):
        return await self.follow_actions.get_follow_data(**kwargs)
    
    async def report(self, reported_user_id: str, reported_by: str, data: dict):
        if reported_user_id==str(reported_by):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="you cannot report yourself")
        self.user_actions.validate_object_id(reported_user_id)
        user=await self.user_actions.get_by_filter({"_id":ObjectId(reported_user_id),"is_verified":True})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

        data["reported_by"] = ObjectId(reported_by)
        data["reported_user"] = ObjectId(reported_user_id)
        data["status"] = "pending"

        try:
            return await self.report_actions.create(data)

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this user"
            )
        
    async def get_monthly_top_users(self):
        return await self.top_users.getMonthlyTopUser()

            
