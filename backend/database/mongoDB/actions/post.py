from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import posts_collection
from bson import ObjectId
from typing import Optional

class PostAction(BaseActions):
    def __init__(self):
        super().__init__(posts_collection)

    # Python me default arguments ek hi baar create hote hain
    # Aur har function call me SAME object reuse hota hai
    async def get_all_with_user(self,
            sort_by: str = "latest",
            cursor: Optional[str] = None,
            limit: int = 10,
            post_id: Optional[str] = None,
            filter: Optional[dict] = None
            ):


        filter = filter or {}

        if post_id:
            filter["_id"] = ObjectId(post_id)


        cursor_filter = {}
        if cursor:
            c = self.decode_cursor(cursor)
            cursor_filter = {
                "$or": [
                    {"created_at": {"$lt": c["created_at"]}},
                    {
                        "created_at": c["created_at"],
                        "_id": {"$lt": c["_id"]}
                    }
                ]
            }

        # 🔹 sort logic
        sort_stage = {"$sort": {"created_at": -1}}

        if sort_by.lower() == "top":
            sort_stage = {"$sort": {"like_count": -1}}
        elif sort_by.lower() == "trending":
            sort_stage = {"$sort": {"like_count": -1, "created_at": -1}}

        pipeline = [
            {"$match": {**filter, **cursor_filter}},

            # 👤 User info (SAFE + LIGHT)
            {
                "$lookup": {
                    "from": "users",
                    "let": {"uid": "$created_by"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$_id", "$$uid"]}}},
                        {
                            "$project": {
                                "_id": 1,
                                "user_name": 1,
                                "profile_pic": 1,
                                "email":1
                            }
                        }
                    ],
                    "as": "user_info"
                }
            },
            {
                "$unwind": {
                    "path": "$user_info",
                    "preserveNullAndEmptyArrays": True
                }
            },

            # 👍 Like count
            {
                "$lookup": {
                    "from": "posts_reactions",
                    "let": {"pid": "$_id"},
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

            # 👎 Dislike count
            {
                "$lookup": {
                    "from": "posts_reactions",
                    "let": {"pid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$post_id", "$$pid"]},
                                        {"$eq": ["$type", "dislike"]}
                                    ]
                                }
                            }
                        },
                        {"$count": "count"}
                    ],
                    "as": "dislikes"
                }
            },

            # 🎯 Final computed fields
            {
                "$addFields": {
                    "like_count": {
                        "$ifNull": [{"$arrayElemAt": ["$likes.count", 0]}, 0]
                    },
                    "dislike_count": {
                        "$ifNull": [{"$arrayElemAt": ["$dislikes.count", 0]}, 0]
                    }
                }
            },

            sort_stage,

            # 📦 Final response
            {
                "$project": {
                    "caption": 1,
                    "tags": 1,
                    "media_url": 1,
                    "media_type": 1,
                    "created_at": 1,
                    "like_count": 1,
                    "dislike_count": 1,
                    "created_by": "$user_info"
                }
            }
        ]

        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        if post_id:
            return docs[0] if docs else None

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1]) if has_next else None,
            "has_next": has_next
        }

    
    
    