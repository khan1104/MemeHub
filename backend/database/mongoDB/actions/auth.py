from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import user_collection,refresh_tokens_collection
from bson import ObjectId

class AuthActions(BaseActions):
    def __init__(self):
        super().__init__(user_collection,True)

    async def find_by_email(self,filter:dict,projection:dict=None):
        return await self.collection.find_one(filter,projection)
    

class TokensActions(BaseActions):
    def __init__(self):
        super().__init__(refresh_tokens_collection)

    async def store_refresh_token(self,data):
        data={
            "user_id": ObjectId(data["user_id"]),
            "refresh_token": data["refresh_token"],
            "created_at": data["created_at"],
            "expires_at": data["expires_at"]
        }
        doc=await self.collection.insert_one(data)
        return doc
    
