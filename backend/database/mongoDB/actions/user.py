from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import user_collection
from database.mongoDB.collections.collection import followers_collection,user_reports
from bson import ObjectId
from datetime import datetime,timedelta


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
        user_id: str | None = None,
        current_user_id: str | None = None
    ):
        match_stage = {
            "is_deleted": False,
            "is_verified": True
        }

        if user_id:
            match_stage["_id"] = ObjectId(user_id)

        current_user_oid = ObjectId(current_user_id) if current_user_id else None

        pipeline = [
            {"$match": match_stage},
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

            # ⭐ CHECK IF CURRENT USER FOLLOWS THIS USER
            {
                "$lookup": {
                    "from": "followers",
                    "let": {
                        "profileUserId": "$_id",
                        "currentUserId": current_user_oid
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$follower_id", "$$currentUserId"]},
                                        {"$eq": ["$following_id", "$$profileUserId"]}
                                    ]
                                }
                            }
                        },
                        {"$limit": 1}
                    ],
                    "as": "is_following_doc"
                }
            },
            # check where current user is friend or not
            {
                "$lookup": {
                    "from": "friends",
                    "let": {
                        "profileUserId": "$_id",
                        "currentUserId": current_user_oid
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$or": [
                                        {
                                            "$and": [
                                                {"$eq": ["$user_one", "$$currentUserId"]},
                                                {"$eq": ["$user_two", "$$profileUserId"]}
                                            ]
                                        },
                                        {
                                            "$and": [
                                                {"$eq": ["$user_one", "$$profileUserId"]},
                                                {"$eq": ["$user_two", "$$currentUserId"]}
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {"$limit": 1}
                    ],
                    "as": "is_friend_doc"
                }
            },

            # 🎯 Computed fields
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
                    },

                    # ✅ FINAL BOOLEAN
                    "isFollowing": {
                        "$gt": [
                            {"$size": "$is_following_doc"},
                            0
                        ]
                    },
                    "isFriend": {
                        "$gt": [
                            {"$size": "$is_friend_doc"},
                            0
                        ]
                    }
                }
            },

            # 🔐 Secure projection
            {
                "$project": {
                    "user_id": {"$toString": "$_id"},
                    "user_name": 1,
                    "profile_pic": 1,
                    "email": 1,
                    "bio":1,
                    "created_at":1,
                    "total_posts": 1,
                    "total_followers": 1,
                    "total_following": 1,
                    "total_friends": 1,
                    "isFollowing": 1,
                    "isFriend": 1,
                }
            }
        ]

        cursor = self.collection.aggregate(pipeline)

        if user_id:
            result = await cursor.to_list(length=1)
            return result[0] if result else None

        return await cursor.to_list(length=None)


    async def getMonthlyTopUser(self):
        pass



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

    async def get_follow_data(
        self,
        user_id: str,
        type: str = "following"  # "following" | "followers"
    ):
        user_id = self.validate_object_id(user_id)

        if type == "following":
            match_stage = {"follower_id": user_id}
            local_field = "following_id"
        else:  # followers
            match_stage = {"following_id": user_id}
            local_field = "follower_id"

        pipeline = [

            # 1️⃣ Match
            {
                "$match": match_stage
            },

            # 2️⃣ Lookup user details
            {
                "$lookup": {
                    "from": "users",
                    "localField": local_field,
                    "foreignField": "_id",
                    "as": "user_doc"
                }
            },

            # 3️⃣ Unwind
            {
                "$unwind": "$user_doc"
            },

            # 4️⃣ Project
            {
                "$project": {
                    "_id": 0,
                    "user_id": {"$toString":"$user_doc._id"},
                    "user_name": "$user_doc.user_name",
                    "profile_pic": "$user_doc.profile_pic",
                    "email": "$user_doc.email",
                    "created_at": 1
                }
            }
        ]

        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        return docs

class ReportActions(BaseActions):
    def __init__(self):
        super().__init__(user_reports)

    