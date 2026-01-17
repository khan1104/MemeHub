from fastapi import HTTPException,status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.posts_action import PostReactionAction,ReportActions
from database.mongoDB.actions.post import PostAction

class PostActionService:
    def __init__(self):
        self.LikeAction = PostReactionAction()
        self.PostAction= PostAction()
        self.ReportAction=ReportActions()

    async def like(self,post_id: str, user_id: str):
        self.PostAction.validate_object_id(post_id)

        post = await self.PostAction.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Post not found"
            )

        return await self.LikeAction.react(user_id, post_id, "like")

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
