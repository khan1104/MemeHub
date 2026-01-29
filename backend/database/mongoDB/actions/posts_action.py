
from database.mongoDB.collections.collection import posts_reaction_collection,post_reports,saved_posts
from database.mongoDB.actions.base import BaseActions
from bson import ObjectId
from datetime import datetime


class PostReactionAction(BaseActions):
    def __init__(self):
        super().__init__(posts_reaction_collection)
        
    async def react(self, user_id: str, post_id: str, reaction_type: str):
        existing = await self.collection.find_one({
            "user_id": ObjectId(user_id),
            "post_id": ObjectId(post_id)
        })

        if existing and existing["type"] == reaction_type:
            await self.collection.delete_one({"_id": existing["_id"]})
            return {"message": f"{reaction_type} removed"}

        if existing and existing["type"] != reaction_type:
            await self.collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"type": reaction_type}}
            )
            return {"message": f"Switched to {reaction_type}"}

        await self.collection.insert_one({
            "user_id": ObjectId(user_id),
            "post_id": ObjectId(post_id),
            "type": reaction_type,
            "created_at": datetime.now()
        })

        return {"message": f"{reaction_type} added"}
        
class ReportActions(BaseActions):
    def __init__(self):
        super().__init__(post_reports)


class SavedActions(BaseActions):
    def __init__(self):
        super().__init__(saved_posts)



    
