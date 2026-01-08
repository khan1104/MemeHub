from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import posts_collection
from bson import ObjectId

class PostAction(BaseActions):
    def __init__(self):
        super().__init__(posts_collection)


    async def get_all_with_user(self,sort_by: str="latest",post_id:str|None=None, filter: dict = {}):
        sort_stage = {"$sort": {"created_at": -1}} 

        if sort_by.lower() == "top":
            sort_stage = {"$sort": {"like_count": -1}}
        elif sort_by.lower() == "trending":
            sort_stage = {"$sort": {"like_count": -1, "created_at": -1}}

        if post_id:
            filter["_id"]=ObjectId(post_id)

        pipeline = [
                {"$match": filter},

                # join user info
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "created_by",
                        "foreignField": "_id",
                        "as": "user_info"
                    }
                },
                {"$unwind": "$user_info"},

                # join reactions info 
                {
                    "$lookup": {
                        "from": "posts_reactions",           
                        "localField": "_id",
                        "foreignField": "post_id",
                        "as": "reactions"
                    }
                },

                # like_count and dislike_count
                {
                    "$addFields": {
                        "like_count": {
                            "$size": {
                                "$filter": {
                                    "input": "$reactions",
                                    "as": "r",
                                    "cond": { "$eq": ["$$r.type", "like"] }
                                }
                            }
                        },
                        "dislike_count": {
                            "$size": {
                                "$filter": {
                                    "input": "$reactions",
                                    "as": "r",
                                    "cond": { "$eq": ["$$r.type", "dislike"] }
                                }
                            }
                        }
                    }
                },
                sort_stage,
                {
                    "$project": {
                        "caption": 1,
                        "tags": 1,
                        "media_url": 1,
                        "created_at": 1,
                        "media_type": 1,
                        "like_count": 1,
                        "dislike_count": 1,
                        "created_by": {
                            "_id": "$user_info._id",
                            "user_name": "$user_info.user_name",
                            "profile_pic": "$user_info.profile_pic"
                        }
                    }
                }
            ]

        cursor = self.collection.aggregate(pipeline)
        results=[doc async for doc in cursor]
        return results[0] if post_id else results
    
    
    