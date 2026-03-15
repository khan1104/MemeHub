from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import friends,friend_requests
from constants.requestStatus import FriendRequestStatus
from bson import ObjectId

class FriendsAction(BaseActions):
    def __init__(self):
        super().__init__(friends)

    async def get_user_friends(
        self,
        user_id: str,
        logged_in_user_id: str,
        sort_by: str = "latest",
        cursor: str | None = None,
        limit: int = 12
    ):
        current_user_oid = self.validate_object_id(user_id)
        logged_in_user_oid = self.validate_object_id(logged_in_user_id)

        pipeline = []

        # 1️⃣ Match
        pipeline.append({
            "$match": {
                "$or": [
                    {"user_one": current_user_oid},
                    {"user_two": current_user_oid}
                ]
            }
        })

        # 2️⃣ friend_id
        pipeline.append({
            "$addFields": {
                "friend_id": {
                    "$cond": {
                        "if": {"$eq": ["$user_one", current_user_oid]},
                        "then": "$user_two",
                        "else": "$user_one"
                    }
                }
            }
        })

        # 3️⃣ friend info
        pipeline.append({
            "$lookup": {
                "from": "users",
                "localField": "friend_id",
                "foreignField": "_id",
                "as": "friend_info"
            }
        })
        pipeline.append({"$unwind": "$friend_info"})

        # 4️⃣ isFollowing
        pipeline.append({
            "$lookup": {
                "from": "followers",
                "let": {
                    "profileUserId": "$friend_id",
                    "loggedInUserId": logged_in_user_oid
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$follower_id", "$$loggedInUserId"]},
                                    {"$eq": ["$following_id", "$$profileUserId"]}
                                ]
                            }
                        }
                    },
                    {"$limit": 1}
                ],
                "as": "is_following_doc"
            }
        })

        # 5️⃣ isFriend
        pipeline.append({
            "$lookup": {
                "from": "friends",
                "let": {
                    "profileUserId": "$friend_id",
                    "loggedInUserId": logged_in_user_oid
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$or": [
                                    {
                                        "$and": [
                                            {"$eq": ["$user_one", "$$loggedInUserId"]},
                                            {"$eq": ["$user_two", "$$profileUserId"]}
                                        ]
                                    },
                                    {
                                        "$and": [
                                            {"$eq": ["$user_one", "$$profileUserId"]},
                                            {"$eq": ["$user_two", "$$loggedInUserId"]}
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
        })

        # 6️⃣ booleans
        pipeline.append({
            "$addFields": {
                "isFollowing": {"$gt": [{"$size": "$is_following_doc"}, 0]},
                "isFriend": {"$gt": [{"$size": "$is_friend_doc"}, 0]}
            }
        })

        # 7️⃣ cursor filtering
        if cursor:
            c = self.decode_cursor(cursor)

            if sort_by == "latest":
                pipeline.append({
                    "$match": {
                        "$or": [
                            {"created_at": {"$lt": c["created_at"]}},
                            {
                                "created_at": c["created_at"],
                                "_id": {"$lt": ObjectId(c["_id"])}
                            }
                        ]
                    }
                })
            else:
                pipeline.append({
                    "$match": {
                        "$or": [
                            {"created_at": {"$gt": c["created_at"]}},
                            {
                                "created_at": c["created_at"],
                                "_id": {"$gt": ObjectId(c["_id"])}
                            }
                        ]
                    }
                })

        # 8️⃣ sorting
        pipeline.append({
            "$sort": {
                "created_at": -1 if sort_by == "latest" else 1,
                "_id": -1 if sort_by == "latest" else 1
            }
        })

        # 9️⃣ limit (+1 for pagination)
        pipeline.append({"$limit": limit + 1})

        # 🔟 projection
        pipeline.append({
            "$project": {
                "created_at": 1,
                "user_id":{"$toString": "$friend_info._id"},
                "user_name": "$friend_info.user_name",
                "profile_pic": "$friend_info.profile_pic",
                "isFollowing": 1,
                "isFriend": 1
            }
        })

        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1], sort_by) if has_next else None,
            "has_next": has_next
        }
    

    async def get_mutual_friends(
        self,
        user_id: str,              # profile user (B)
        logged_in_user_id: str,    # current user (A)
        cursor: str | None = None,
        limit: int = 12
):
        user_oid = ObjectId(user_id)
        current_user_oid = ObjectId(logged_in_user_id)

        pipeline = []

        # 1️⃣ Get current user friends
        pipeline.append({
            "$match": {
                "$or": [
                    {"user_one": current_user_oid},
                    {"user_two": current_user_oid}
                ]
            }
        })

        # 2️⃣ Extract friend_id
        pipeline.append({
            "$addFields": {
                "friend_id": {
                    "$cond": {
                        "if": {"$eq": ["$user_one", current_user_oid]},
                        "then": "$user_two",
                        "else": "$user_one"
                    }
                }
            }
        })

        # 3️⃣ Group all friend_ids of A
        pipeline.append({
            "$group": {
                "_id": None,
                "current_user_friends": {"$addToSet": "$friend_id"}
            }
        })

        # 4️⃣ Lookup profile user friends (B) & filter mutual
        pipeline.append({
            "$lookup": {
                "from": "friends",
                "let": {
                    "userFriends": "$current_user_friends"
                },
                "pipeline": [

                    {
                        "$match": {
                            "$or": [
                                {"user_one": user_oid},
                                {"user_two": user_oid}
                            ]
                        }
                    },

                    {
                        "$addFields": {
                            "friend_id": {
                                "$cond": {
                                    "if": {"$eq": ["$user_one", user_oid]},
                                    "then": "$user_two",
                                    "else": "$user_one"
                                }
                            }
                        }
                    },

                    {
                        "$match": {
                            "$expr": {
                                "$in": ["$friend_id", "$$userFriends"]
                            }
                        }
                    }

                ],
                "as": "mutuals"
            }
        })

        # 5️⃣ Unwind
        pipeline.append({"$unwind": "$mutuals"})

        # 6️⃣ Replace root with mutual doc (important for sorting)
        pipeline.append({
            "$replaceRoot": {"newRoot": "$mutuals"}
        })

        # 7️⃣ Cursor pagination
        if cursor:
            c = self.decode_cursor(cursor)

            pipeline.append({
                "$match": {
                    "$or": [
                        {"created_at": {"$lt": c["created_at"]}},
                        {
                            "created_at": c["created_at"],
                            "_id": {"$lt": ObjectId(c["_id"])}
                        }
                    ]
                }
            })

        # 8️⃣ Sorting (latest mutuals)
        pipeline.append({
            "$sort": {
                "created_at": -1,
                "_id": -1
            }
        })

        # 9️⃣ Limit (+1 trick)
        pipeline.append({"$limit": limit + 1})

        # 🔟 Lookup user info
        pipeline.append({
            "$lookup": {
                "from": "users",
                "localField": "friend_id",
                "foreignField": "_id",
                "as": "user_info"
            }
        })
        pipeline.append({"$unwind": "$user_info"})

        # 1️⃣1️⃣ isFollowing
        pipeline.append({
            "$lookup": {
                "from": "followers",
                "let": {
                    "profileUserId": "$friend_id",
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
        })

        # 1️⃣2️⃣ Boolean field
        pipeline.append({
            "$addFields": {
                "isFollowing": {
                    "$gt": [{"$size": "$is_following_doc"}, 0]
                }
            }
        })

        # 1️⃣3️⃣ Final projection
        pipeline.append({
            "$project": {
                "created_at": 1,
                "user_id":{"$toString": "$user_info._id"},
                "user_name": "$user_info.user_name",
                "profile_pic": "$user_info.profile_pic",
            }
        })

        # 🚀 Execute
        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1]) if has_next else None,
            "has_next": has_next
        }


class FriendRequestAction(BaseActions):
    def __init__(self):
        super().__init__(friend_requests)


    async def get_requests(
        self,
        current_user_id:str,
        type: str = "get",   #sent or get
        cursor: str|None = None,
        limit: int = 12):

        current_user_oid = ObjectId(current_user_id)

        match_stage={}
        

        # get all requests sent by other users
        if type == "get":
            match_stage["recipient_id"]= current_user_oid
            match_stage["status"]=FriendRequestStatus.PENDING
            local_field = "requester_id"
        # get all request send to other users
        else:  
            match_stage["requester_id"]= current_user_oid
            match_stage["status"]=FriendRequestStatus.PENDING
            local_field = "recipient_id"
        if cursor:
            c = self.decode_cursor(cursor)
            match_stage["_id"] = {"$lt": c["_id"]}

        pipeline=[]


        pipeline.append({
            "$match":match_stage
        })

        pipeline.append({
            "$sort":{"_id": -1}
        })

        pipeline.append({
            "$limit": limit + 1
        })
        pipeline.append({
            "$lookup": {
                "from": "users",
                "localField": local_field,
                "foreignField": "_id",
                "as": "user_info"
            }
        })

        pipeline.append({
            "$unwind": "$user_info"
        })
        
        pipeline.append({
            "$project": {
                "id":{"$toString": "$_id"},
                "user_id":{"$toString": "$user_info._id"},
                "user_name": "$user_info.user_name",
                "profile_pic": "$user_info.profile_pic",
                "created_at": 1,
            }
        })


        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1]) if has_next else None,
            "has_next": has_next
        }

