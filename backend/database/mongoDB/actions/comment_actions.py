
from database.mongoDB.collections.collection import comments_collection,comments_reaction_collection,comments_reports
from database.mongoDB.actions.base import BaseActions
from bson import ObjectId
from datetime import datetime
from typing import Optional


class CommentActions(BaseActions):
    def __init__(self):
        super().__init__(comments_collection)


    async def get_comments(
        self,
        post_id: str,
        sort_by: str = "latest",
        cursor: Optional[str] = None,
        limit: int = 2
    ):
        post_id = ObjectId(post_id)

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

        sort_stage = {"$sort": {"created_at": -1, "_id": -1}}

        if sort_by == "top":
            sort_stage = {"$sort": {"like_count": -1, "_id": -1}}

        pipeline = [
            {
                "$match": {
                    "post_id": post_id,
                    **cursor_filter
                }
            },

            # 👤 user
            {
                "$lookup": {
                    "from": "users",
                    "let": {"uid": "$user_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$_id", "$$uid"]}}},
                        {"$project": {"user_name": 1, "profile_pic": 1}}
                    ],
                    "as": "user_info"
                }
            },
            {"$unwind": "$user_info"},

            # 👍 likes
            {
                "$lookup": {
                    "from": "comments_reactions",
                    "let": {"cid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$comment_id", "$$cid"]},
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

            # 👎 dislikes
            {
                "$lookup": {
                    "from": "comments_reactions",
                    "let": {"cid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$comment_id", "$$cid"]},
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
            {"$limit": limit + 1},

            {
                "$project": {
                    "comment": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "like_count": 1,
                    "dislike_count": 1,
                    "created_by": "$user_info"
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
        
