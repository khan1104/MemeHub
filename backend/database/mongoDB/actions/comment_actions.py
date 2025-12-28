
from database.mongoDB.collections.collection import comments_collection,comments_reaction_collection,comments_reports
from database.mongoDB.actions.base import BaseActions
from bson import ObjectId
from datetime import datetime


class CommentActions(BaseActions):
    def __init__(self):
        super().__init__(comments_collection)


    async def get_all_comments_with_user(self, post_id: str):
        post_id = ObjectId(post_id)

        pipeline = [
            {
                "$match": {
                    "post_id": post_id
                }
            },

            # join user info of who commented
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {"$unwind": "$user_info"},

            # join comment reactions
            {
                "$lookup": {
                    "from": "comments_reactions",
                    "localField": "_id",
                    "foreignField": "comment_id",
                    "as": "reactions"
                }
            },

            # count likes and dislikes
            {
                "$addFields": {
                    "like_count": {
                        "$size": {
                            "$filter": {
                                "input": "$reactions",
                                "as": "r",
                                "cond": {"$eq": ["$$r.type", "like"]}
                            }
                        }
                    },
                    "dislike_count": {
                        "$size": {
                            "$filter": {
                                "input": "$reactions",
                                "as": "r",
                                "cond": {"$eq": ["$$r.type", "dislike"]}
                            }
                        }
                    }
                }
            },

            {"$sort": {"created_at": -1}},
            {
                "$project": {
                    "comment": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "like_count": 1,
                    "dislike_count": 1,

                    "created_by": {
                        "user_name": "$user_info.user_name",
                        "profile_pic": "$user_info.profile_pic"
                    }
                }
            }
        ]

        cursor = self.collection.aggregate(pipeline)
        return [doc async for doc in cursor]


class CommentReactionActions(BaseActions):
    def __init__(self):
        super().__init__(comments_reaction_collection)

    async def react(self, user_id: str, comment_id: str, reaction_type: str):
        existing = await self.collection.find_one({
            "user_id": ObjectId(user_id),
            "comment_id": ObjectId(comment_id)
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
            "comment_id": ObjectId(comment_id),
            "type": reaction_type,
            "created_at": datetime.now()
        })

        return {"message": f"{reaction_type} added"}
    


class ReportActions(BaseActions):
    def __init__(self):
        super().__init__(comments_reports)
        
