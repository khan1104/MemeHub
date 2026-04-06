from fastapi import HTTPException,status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.posts_action import PostReactionAction,ReportActions,SavedActions
from database.mongoDB.actions.post import PostAction

class PostActionService:
    def __init__(self):
        self.like_actions = PostReactionAction()
        self.post_actions= PostAction()
        self.report_actions=ReportActions()
        self.saved_actions=SavedActions()

    async def like(self,post_id: str, user_id: str):
        self.post_actions.validate_object_id(post_id)

        post = await self.post_actions.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )

        return await self.like_actions.react(user_id, post_id, "like")
    
    async def get_likedPosts(self,**kwargs):
        return await self.like_actions.get_liked_post(**kwargs)
        


    async def dislike(self,post_id: str, user_id: str):
        self.post_actions.validate_object_id(post_id)

        post = await self.post_actions.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )

        return await self.like_actions.react(user_id, post_id, "dislike")
    
    async def report(self,post_id: str, reported_by: str, data: dict):

        self.post_actions.validate_object_id(post_id)
        user =await self.post_actions.get_data_by_id(post_id,{"created_by":1})
        if user["created_by"]==reported_by:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you cannot report you own post")
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="post does not exist")

        data["reported_by"] = ObjectId(reported_by)
        data["reported_post"] = ObjectId(post_id)
        data["status"] = "pending"

        try:
            return await self.report_actions.create(data)

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this post"
            )
        
    async def save(self,post_id:str,saved_by:str):
        self.post_actions.validate_object_id(post_id)
        post = await self.post_actions.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )
        already_saved=await self.saved_actions.get_by_filter({"post_id":ObjectId(post_id),"saved_by":saved_by})
        if already_saved:
            await self.saved_actions.hard_delete(already_saved["_id"])
            return {"message":"post is removed from saved"}
        data={
            "post_id":ObjectId(post_id),
            "saved_by":saved_by
        }
        await self.saved_actions.create(data)
        return {"message":"post is saved"}
    
    async def get_saved_posts(self,**kwargs):
        return await self.saved_actions.get_saved_post(**kwargs)
      
        
        

        


