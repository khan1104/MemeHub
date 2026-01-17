from bson import ObjectId
from datetime import datetime
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.user import UserActions
from fastapi import HTTPException,status
from database.mongoDB.actions.user import FollowActions,ReportActions
from database.mongoDB.collections.collection import posts_collection,posts_reaction_collection,comments_reaction_collection,followers_collection,refresh_tokens_collection
from utils.upload_to_bucket import upload_to_bucket
from core.config import settings
class UserService:
    def __init__(self):
        self.UserActions=UserActions()
        self.FollowAction=FollowActions()
        self.ReportAction=ReportActions()

    async def getAllUsers(self):
        data=await self.UserActions.get_user_with_details()
        return data
        # return await self.UserActions.get_all(projection={"password":0})
    
    async def search_users(self, query: str):

        if not query:
            return []
        projection = {"user_name": 1}

        users = await self.UserActions.get_all(
            {"user_name": {"$regex": query, "$options": "i"}},
            projection=projection
        )
        return users

    async def getCurrentUser(self,user_id:str):
        data=await self.UserActions.get_user_with_details(user_id)
        return data
    
    async def get_user_by_id(self,user_id:str):
        self.UserActions.validate_object_id(user_id)
        data=await self.UserActions.get_user_with_details(user_id)
        
        if data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        return data
    
    async def upadteUser(self,current_user_id:str,data:dict):
        await self.UserActions.updated(current_user_id,data)

    async def updateProfilePic(self,current_user_id:str, profile_pic):
        
        file_ext = profile_pic.filename.split(".")[-1].lower()
        url = await upload_to_bucket(
            bucket=settings.PROFILE_PICS_BUCKET,
            file=profile_pic,
            file_ext=file_ext
        )
        await self.UserActions.updated(current_user_id, {"profile_pic": url})
        return url

    
    async def deleteUser(self,id:str):
        self.UserActions.validate_object_id(id)
        data=await self.UserActions.get_data_by_id(id)
        if data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        deleted_user=await self.UserActions.soft_delete(id)
        await posts_collection.delete_many({"created_by":ObjectId(id)})
        await posts_reaction_collection.delete_many({"user_id":ObjectId(id)})
        await comments_reaction_collection.delete_many({"user_id":ObjectId(id)})
        await followers_collection.delete_many({"follower_id":ObjectId(id)})
        await refresh_tokens_collection.delete_one({"user_id":ObjectId(id)})
        return deleted_user
    
    async def follow(self,to_follow:str,by_follow:str):
        self.FollowAction.validate_object_id(to_follow)
        if(str(to_follow)==str(by_follow)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="you cannot follow yourself")
        user=await self.UserActions.get_data_by_id(to_follow)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not exists")
        action=await self.FollowAction.follow(to_follow,by_follow)
        return action
    
    async def report(self, reported_user_id: str, reported_by: str, data: dict):
        if reported_user_id==str(reported_by):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="you cannot report yourself")
        self.UserActions.validate_object_id(reported_user_id)
        user=await self.UserActions.get_by_filter({"_id":ObjectId(reported_user_id),"is_verified":True})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

        data["reported_by"] = ObjectId(reported_by)
        data["reported_user"] = ObjectId(reported_user_id)
        data["status"] = "pending"

        try:
            return await self.ReportAction.create(data)

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this user"
            )
        
    async def get_monthly_top_users(self):
        users=await self.UserActions.get_by_filter({})

            
