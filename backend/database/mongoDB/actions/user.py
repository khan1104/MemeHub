from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import user_collection
from database.mongoDB.collections.collection import followers_collection,user_reports
from bson import ObjectId
from datetime import datetime


class UserActions(BaseActions):
    def __init__(self):
        super().__init__(user_collection,True)
    
    async def get_all(self, filter: dict = None,projection: dict = None):
        filter = filter or {}
        filter["is_deleted"] = False
        filter["is_verified"]=True

        cursor = self.collection.find(filter,projection)
        return [doc async for doc in cursor]
    
    async def get_user_with_details(
    self,
    user_id: str | None = None
    ):
        match_stage = {
            "is_deleted": False,
            "is_verified": True
        }

        if user_id:
            match_stage["_id"] = ObjectId(user_id)

        pipeline = [
            {"$match": match_stage},

            # 🧮 Posts count
            {
                "$lookup": {
                    "from": "posts",
                    "let": {"uid": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$created_by", "$$uid"]}}},
                        {"$count": "count"}
                    ],
                    "as": "posts"
                }
            },

            # 🧮 Followers count
            {
                "$lookup": {
                    "from": "followers",
                    "let": {"uid": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$following_id", "$$uid"]}}},
                        {"$count": "count"}
                    ],
                    "as": "followers"
                }
            },

            # 🧮 Following count
            {
                "$lookup": {
                    "from": "followers",
                    "let": {"uid": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$follower_id", "$$uid"]}}},
                        {"$count": "count"}
                    ],
                    "as": "following"
                }
            },

            # 🧮 Friends count
            {
                "$lookup": {
                    "from": "friends",
                    "let": {"uid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$or": [
                                        {"$eq": ["$user_one", "$$uid"]},
                                        {"$eq": ["$user_two", "$$uid"]}
                                    ]
                                }
                            }
                        },
                        {"$count": "count"}
                    ],
                    "as": "friends"
                }
            },

            # 🎯 Final computed fields
            {
                "$addFields": {
                    "total_posts": {
                        "$ifNull": [{"$arrayElemAt": ["$posts.count", 0]}, 0]
                    },
                    "total_followers": {
                        "$ifNull": [{"$arrayElemAt": ["$followers.count", 0]}, 0]
                    },
                    "total_following": {
                        "$ifNull": [{"$arrayElemAt": ["$following.count", 0]}, 0]
                    },
                    "total_friends": {
                        "$ifNull": [{"$arrayElemAt": ["$friends.count", 0]}, 0]
                    }
                }
            },

            # 🔐 Secure projection
            {
                "$project": {
                    "password": 0,
                    "posts": 0,
                    "followers": 0,
                    "following": 0,
                    "friends": 0
                }
            }
        ]

        cursor = self.collection.aggregate(pipeline)

        if user_id:
            result = await cursor.to_list(length=1)
            return result[0] if result else None

        return await cursor.to_list(length=None)


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

    