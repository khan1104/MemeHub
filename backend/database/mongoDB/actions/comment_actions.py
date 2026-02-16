
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
            limit: int = 10,
            user_id: Optional[str] = None,
    ):
            post_oid = ObjectId(post_id)
            current_user_oid = ObjectId(user_id) if user_id else None

            # -----------------------------------------
            # Cursor Decode
            # -----------------------------------------
            cursor_filter = {}

            if cursor:
                c = self.decode_cursor(cursor)

                if sort_by == "top":
                    cursor_filter = {
                        "$or": [
                            {"like_count": {"$lt": c["like_count"]}},
                            {
                                "like_count": c["like_count"],
                                "_id": {"$lt": ObjectId(c["_id"])}
                            }
                        ]
                    }
                else:
                    cursor_filter = {
                        "$or": [
                            {"created_at": {"$lt": c["created_at"]}},
                            {
                                "created_at": c["created_at"],
                                "_id": {"$lt": ObjectId(c["_id"])}
                            }
                        ]
                    }

            # -----------------------------------------
            # Base Match
            # -----------------------------------------
            pipeline = [
                {
                    "$match": {
                        "post_id": post_oid,
                        **cursor_filter
                    }
                }
            ]

            # -----------------------------------------
            # Sort EARLY for latest (performance boost)
            # -----------------------------------------
            if sort_by == "latest":
                pipeline.append({
                    "$sort": {"created_at": -1, "_id": -1}
                })

            # -----------------------------------------
            # User Info
            # -----------------------------------------
            pipeline += [
                {
                    "$lookup": {
                        "from": "users",
                        "let": {"uid": "$user_id"},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": ["$_id", "$$uid"]}}},
                            {
                                "$project": {
                                    "user_name": 1,
                                    "profile_pic": 1,
                                    "email": 1
                                }
                            }
                        ],
                        "as": "user_info"
                    }
                },
                {"$unwind": "$user_info"},
            ]

            # -----------------------------------------
            # Reactions (OPTIMIZED - single lookup)
            # -----------------------------------------
            pipeline.append({
                "$lookup": {
                    "from": "comments_reactions",
                    "let": {"cid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {"$eq": ["$comment_id", "$$cid"]}
                            }
                        },
                        {
                            "$group": {
                                "_id": "$type",
                                "count": {"$sum": 1}
                            }
                        }
                    ],
                    "as": "reactions"
                }
            })

            # -----------------------------------------
            # My Reaction
            # -----------------------------------------
            if current_user_oid:
                pipeline.append({
                    "$lookup": {
                        "from": "comments_reactions",
                        "let": {"cid": "$_id"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {"$eq": ["$comment_id", "$$cid"]},
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
                pipeline.append({
                    "$addFields": {"my_reaction": []}
                })

            # -----------------------------------------
            # Compute Fields
            # -----------------------------------------
            pipeline.append({
                "$addFields": {

                    # Extract like_count
                    "like_count": {
                        "$ifNull": [
                            {
                                "$first": {
                                    "$map": {
                                        "input": {
                                            "$filter": {
                                                "input": "$reactions",
                                                "as": "r",
                                                "cond": {"$eq": ["$$r._id", "like"]}
                                            }
                                        },
                                        "as": "x",
                                        "in": "$$x.count"
                                    }
                                }
                            },
                            0
                        ]
                    },

                    # Extract dislike_count
                    "dislike_count": {
                        "$ifNull": [
                            {
                                "$first": {
                                    "$map": {
                                        "input": {
                                            "$filter": {
                                                "input": "$reactions",
                                                "as": "r",
                                                "cond": {"$eq": ["$$r._id", "dislike"]}
                                            }
                                        },
                                        "as": "x",
                                        "in": "$$x.count"
                                    }
                                }
                            },
                            0
                        ]
                    },

                    "is_liked": {
                        "$in": ["like", "$my_reaction.type"]
                    },
                    "is_disliked": {
                        "$in": ["dislike", "$my_reaction.type"]
                    },

                    # cursor helper
                    "_cursor_id": "$_id"
                }
            })

            # -----------------------------------------
            # Sort for TOP
            # -----------------------------------------
            if sort_by == "top":
                pipeline.append({
                    "$sort": {"like_count": -1, "_id": -1}
                })

            # -----------------------------------------
            # Limit
            # -----------------------------------------
            pipeline.append({"$limit": limit + 1})

            # -----------------------------------------
            # Final Projection
            # -----------------------------------------
            pipeline.append({
                "$project": {
                    "comment_id": {"$toString": "$_id"},
                    "_cursor_id": {"$toString": "$_cursor_id"},
                    "comment": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "like_count": 1,
                    "dislike_count": 1,
                    "is_liked": 1,
                    "is_disliked": 1,
                    "created_by": {
                        "user_id": {"$toString": "$user_info._id"},
                        "user_name": "$user_info.user_name",
                        "email": "$user_info.email",
                        "profile_pic": "$user_info.profile_pic"
                    }
                }
            })

            # -----------------------------------------
            # Execute
            # -----------------------------------------
            cursor_db = self.collection.aggregate(pipeline)
            docs = [doc async for doc in cursor_db]

            # -----------------------------------------
            # Pagination logic
            # -----------------------------------------
            has_next = len(docs) > limit
            docs = docs[:limit]

            next_cursor = None
            if has_next and docs:
                last = docs[-1]
                next_cursor = self.encode_cursor({
                    "_id": last["_cursor_id"],
                    "created_at": last["created_at"],
                    "like_count": last["like_count"]
                })

            return {
                "items": docs,
                "next_cursor": next_cursor,
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
        
