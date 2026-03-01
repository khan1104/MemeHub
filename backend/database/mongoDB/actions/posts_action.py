
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
    
    async def get_liked_post(
        self,
        user_id: str,
        cursor: str|None = None,
        limit: int = 1
    ):
        user_id = self.validate_object_id(user_id)
        filter={
                "user_id": user_id
        }
        if cursor:
            c = self.decode_cursor(cursor)
            filter["_id"] = {"$lt": c["_id"]}
            print(c)
        pipeline = [
            # 1️⃣ Match saved posts
            {
                "$match": filter
            },
            {"$sort": {"_id": -1}},

        # ✅ LIMIT + 1
            {"$limit": limit + 1},

            # 2️⃣ Get post details
            {
                "$lookup": {
                    "from": "posts",
                    "localField": "post_id",
                    "foreignField": "_id",
                    "as": "post_doc"
                }
            },

            {
                "$unwind": {
                    "path": "$post_doc",
                    "preserveNullAndEmptyArrays": False
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "post_doc.created_by",  # ✅ FIX
                    "foreignField": "_id",
                    "as": "user_doc"
                }
            },
            {
                "$unwind": {
                    "path": "$user_doc",
                    "preserveNullAndEmptyArrays": False
                }
            },


            # 3️⃣ Get like count (FIXED pid reference)
            {
                "$lookup": {
                    "from": "posts_reactions",
                    "let": {"pid": "$post_doc._id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$post_id", "$$pid"]},
                                        {"$eq": ["$type", "like"]}
                                    ]
                                }
                            }
                        },
                        {"$count": "count"}
                    ],
                    "as": "likes"
                }
            },

            # 4️⃣ Add like_count field
            {
                "$addFields": {
                    "like_count": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$likes.count", 0]},
                            0
                        ]
                    }
                }
            },

            # 5️⃣ Final projection
            {
                "$project": {
                    "_id": 1,
                    "post_id": {"$toString": "$post_doc._id"},
                    "caption": "$post_doc.caption",
                    "media_url": "$post_doc.media_url",
                    "media_type": "$post_doc.media_type",
                    "created_at": "$post_doc.created_at",
                    "like_count": 1,
                    "created_by": {
                        "user_id":{"$toString": "$user_doc._id"},
                        "user_name":"$user_doc.user_name",
                        "profile_pic":"$user_doc.profile_pic"
                }
                }
            }
        ]
        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1]) if has_next else None,
            "has_next": has_next
        }
        
class ReportActions(BaseActions):
    def __init__(self):
        super().__init__(post_reports)


class SavedActions(BaseActions):
    def __init__(self):
        super().__init__(saved_posts)

    async def get_saved_post(
        self,
        user_id: str,
        cursor: str|None = None,
        limit: int = 10
    ):
        user_id = self.validate_object_id(user_id)

        pipeline = [
            # 1️⃣ Match saved posts
            {
                "$match": {
                    "saved_by": user_id
                }
            },
            {"$sort": {"_id": -1}},
            {"$limit": limit + 1},

            # 2️⃣ Get post details
            {
                "$lookup": {
                    "from": "posts",
                    "localField": "post_id",
                    "foreignField": "_id",
                    "as": "post_doc"
                }
            },
            {
                "$unwind": {
                    "path": "$post_doc",
                    "preserveNullAndEmptyArrays": False
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "post_doc.created_by",  # ✅ FIX
                    "foreignField": "_id",
                    "as": "user_doc"
                }
            },
            {
                "$unwind": {
                    "path": "$user_doc",
                    "preserveNullAndEmptyArrays": False
                }
            },

            # 3️⃣ Get like count (FIXED pid reference)
            {
                "$lookup": {
                    "from": "posts_reactions",
                    "let": {"pid": "$post_doc._id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$post_id", "$$pid"]},
                                        {"$eq": ["$type", "like"]}
                                    ]
                                }
                            }
                        },
                        {"$count": "count"}
                    ],
                    "as": "likes"
                }
            },

            # 4️⃣ Add like_count field
            {
                "$addFields": {
                    "like_count": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$likes.count", 0]},
                            0
                        ]
                    }
                }
            },

            # 5️⃣ Final projection
            {
                "$project": {
                    "_id": 0,
                    "post_id": {"$toString": "$post_doc._id"},
                    "caption": "$post_doc.caption",
                    "media_url": "$post_doc.media_url",
                    "media_type": "$post_doc.media_type",
                    "created_at": "$post_doc.created_at",
                    "like_count": 1,
                    "created_by": {
                        "user_id":{"$toString": "$user_doc._id"},
                        "user_name":"$user_doc.user_name",
                        "profile_pic":"$user_doc.profile_pic"
                }
                }
            }
        ]

        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1]) if has_next else None,
            "has_next": has_next
        }



    
