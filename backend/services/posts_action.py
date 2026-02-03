from fastapi import HTTPException,status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.posts_action import PostReactionAction,ReportActions,SavedActions
from database.mongoDB.actions.post import PostAction

class PostActionService:
    def __init__(self):
        self.LikeAction = PostReactionAction()
        self.PostAction= PostAction()
        self.ReportAction=ReportActions()
        self.Savedaction=SavedActions()

    async def like(self,post_id: str, user_id: str):
        self.PostAction.validate_object_id(post_id)

        post = await self.PostAction.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )

        return await self.LikeAction.react(user_id, post_id, "like")
    
    async def get_likedPosts(self,liked_by):
        liked_post_doc=await self.LikeAction.get_all({"user_id":liked_by,"type":"like"})
        list_post=[]
        for doc in liked_post_doc:
            post_id=doc["post_id"]
            list_post.append(post_id)
        return await self.PostAction.get_all_with_user(query_filter={"_id": {"$in": list_post}})


    async def dislike(self,post_id: str, user_id: str):
        self.PostAction.validate_object_id(post_id)

        post = await self.PostAction.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )

        return await self.LikeAction.react(user_id, post_id, "dislike")
    
    async def report(self,post_id: str, reported_by: str, data: dict):

        self.PostAction.validate_object_id(post_id)
        user =await self.PostAction.get_data_by_id(post_id,{"created_by":1})
        if user["created_by"]==reported_by:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you cannot report you own post")
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="post does not exist")

        data["reported_by"] = ObjectId(reported_by)
        data["reported_post"] = ObjectId(post_id)
        data["status"] = "pending"

        try:
            return await self.ReportAction.create(data)

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this post"
            )
        
    async def save(self,post_id:str,saved_by:str):
        self.PostAction.validate_object_id(post_id)
        post = await self.PostAction.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )
        already_saved=await self.Savedaction.get_by_filter({"post_id":ObjectId(post_id),"saved_by":saved_by})
        if already_saved:
            await self.Savedaction.hard_delete(already_saved["_id"])
            return {"message":"post is removed from saved"}
        data={
            "post_id":ObjectId(post_id),
            "saved_by":saved_by
        }
        await self.Savedaction.create(data)
        return {"message":"post is saved"}
    
    async def get_saved_posts(self,saved_by:str):
        saved_post_doc=await self.Savedaction.get_all({"saved_by":saved_by})
        list_post=[]
        for doc in saved_post_doc:
            post_id=doc["post_id"]
            list_post.append(post_id)
        return await self.PostAction.get_all_with_user(query_filter={"_id": {"$in": list_post}})
        
        

        


