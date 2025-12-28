from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import user_collection
from database.mongoDB.collections.collection import followers_collection,user_reports
from bson import ObjectId
from datetime import datetime


class UserActions(BaseActions):
    def __init__(self):
        super().__init__(user_collection,True)

    async def get_data_by_id(self, id,projection: dict = None):
        query = {"_id": ObjectId(id),"is_deleted":False,"is_verified":True}

        return await self.collection.find_one(query,projection)
    
    async def get_all(self, filter: dict = None,projection: dict = None):
        filter = filter or {}
        filter["is_deleted"] = False
        filter["is_verified"]=True

        cursor = self.collection.find(filter,projection)
        return [doc async for doc in cursor]

class FollowActions(BaseActions):
    def __init__(self):
        super().__init__(followers_collection)

    async def follow(self,following_id:str,follower_id:str):
        existing =await self.collection.find_one({
            "following_id": ObjectId(following_id),
            "follower_id": ObjectId(follower_id)
        })
        
        if existing:
            await self.collection.delete_one({"_id": existing["_id"]})
            return {"message": "unfollow"}
        else:
            await self.collection.insert_one({
                "following_id": ObjectId(following_id),
                "follower_id": ObjectId(follower_id),
                "created_at": datetime.now()
            })
            return {"message": "following"}
        

class ReportActions(BaseActions):
    def __init__(self):
        super().__init__(user_reports)

    