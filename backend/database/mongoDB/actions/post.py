from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import posts_collection
from bson import ObjectId
from typing import Optional
from datetime import datetime
import base64, json


class PostAction(BaseActions):
    def __init__(self):
        super().__init__(posts_collection)

    async def get_all_with_user(
        self,
        sort_by: str = "latest",
        cursor: Optional[str] = None,
        limit: int = 10,
        post_id: Optional[str] = None,
        filter: Optional[dict] = None,
        user_id: Optional[str] = None,
    ):

        filter = filter or {}

        if post_id:
            filter["_id"] = ObjectId(post_id)

        # ---------------------------------------
        # Logged in user
        # ---------------------------------------
        current_user_oid = ObjectId(user_id) if user_id else None

        # =======================================
        # PIPELINE
        # =======================================

        pipeline = []

        # ---------------------------------------
        # 1️⃣ Base match
        # ---------------------------------------
        pipeline.append({"$match": filter})

        # ---------------------------------------
        # 2️⃣ Post owner
        # ---------------------------------------
        pipeline.extend([
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
                                "email": 1
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
            }
        ])

        # ---------------------------------------
        # 3️⃣ Likes
        # ---------------------------------------
        pipeline.append({
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
        })

        # ---------------------------------------
        # 4️⃣ Dislikes
        # ---------------------------------------
        pipeline.append({
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
        })

        # ---------------------------------------
        # 5️⃣ User reaction
        # ---------------------------------------
        if current_user_oid:
            pipeline.append({
                "$lookup": {
                    "from": "posts_reactions",
                    "let": {"pid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$post_id", "$$pid"]},
                                        {"$eq": ["$user_id", current_user_oid]}
                                    ]
                                }
                            }
                        },
                        {"$project": {"type": 1}}
                    ],
                    "as": "my_reaction"
                }
            })
        else:
            pipeline.append({"$addFields": {"my_reaction": []}})

        # ---------------------------------------
        # 6️⃣ Computed fields
        # ---------------------------------------
        pipeline.append({
            "$addFields": {
                "like_count": {
                    "$ifNull": [{"$arrayElemAt": ["$likes.count", 0]}, 0]
                },
                "dislike_count": {
                    "$ifNull": [{"$arrayElemAt": ["$dislikes.count", 0]}, 0]
                },
                "is_liked": {"$in": ["like", "$my_reaction.type"]},
                "is_disliked": {"$in": ["dislike", "$my_reaction.type"]}
            }
        })

        # ---------------------------------------
        # 7️⃣ Cursor pagination
        # ---------------------------------------
        if cursor:
            c = self.decode_cursor(cursor)

            if sort_by == "latest":
                pipeline.append({
                    "$match": {
                        "$or": [
                            {"created_at": {"$lt": c["created_at"]}},
                            {
                                "created_at": c["created_at"],
                                "_id": {"$lt": c["_id"]}
                            }
                        ]
                    }
                })

            elif sort_by == "top":
                pipeline.append({
                    "$match": {
                        "$or": [
                            {"like_count": {"$lt": c["like_count"]}},
                            {
                                "like_count": c["like_count"],
                                "_id": {"$lt": c["_id"]}
                            }
                        ]
                    }
                })

            elif sort_by == "trending":
                pipeline.append({
                    "$match": {
                        "$or": [
                            {"like_count": {"$lt": c["like_count"]}},
                            {
                                "like_count": c["like_count"],
                                "created_at": {"$lt": c["created_at"]}
                            },
                            {
                                "like_count": c["like_count"],
                                "created_at": c["created_at"],
                                "_id": {"$lt": c["_id"]}
                            }
                        ]
                    }
                })

        # ---------------------------------------
        # 8️⃣ Sorting
        # ---------------------------------------
        if sort_by == "top":
            pipeline.append({"$sort": {"like_count": -1, "_id": -1}})
        elif sort_by == "trending":
            pipeline.append({"$sort": {"like_count": -1, "created_at": -1, "_id": -1}})
        else:
            pipeline.append({"$sort": {"created_at": -1, "_id": -1}})

        # ---------------------------------------
        # 9️⃣ limit + 1
        # ---------------------------------------
        pipeline.append({"$limit": limit + 1})

        # ---------------------------------------
        # 🔟 Final output
        # ---------------------------------------
        pipeline.append({
            "$project": {
                "caption": 1,
                "tags": 1,
                "media_url": 1,
                "media_type": 1,
                "created_at": 1,
                "like_count": 1,
                "dislike_count": 1,
                "is_liked": 1,
                "is_disliked": 1,
                "created_by": "$user_info"
            }
        })

        # =======================================
        # EXECUTE
        # =======================================

        cursor_db = self.collection.aggregate(pipeline)
        docs = [doc async for doc in cursor_db]

        if post_id:
            return docs[0] if docs else None

        has_next = len(docs) > limit
        docs = docs[:limit]

        return {
            "items": docs,
            "next_cursor": self.encode_cursor(docs[-1], sort_by) if has_next else None,
            "has_next": has_next
        }
