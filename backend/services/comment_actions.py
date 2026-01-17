from fastapi import HTTPException,status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.comment_actions import CommentActions,CommentReactionActions,ReportActions
from database.mongoDB.actions.post import PostAction


class CommentService:

    def __init__(self):
        self.CommentAction = CommentActions()
        self.PostAction=PostAction()

    async def get_comments(self,post_id:str,sort_by:str,cursor:str,limit:str):

        self.CommentAction.validate_object_id(post_id)
        post=await self.PostAction.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Post not found")
        
        data=await self.CommentAction.get_comments(post_id,sort_by,cursor,limit)
        return data
    
    async def add_comment(self,post_id:str,user_id:str,comment:str):
        self.CommentAction.validate_object_id(post_id)
        post=await self.PostAction.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Post not found")
        action=await self.CommentAction.create({"user_id":user_id,"post_id":ObjectId(post_id),"comment":comment})
        return action
    
    async def update(self,comment_id:str,user_id:str,updated_comment:str):
        self.CommentAction.validate_object_id(comment_id)
        comment=await self.CommentAction.get_data_by_id(comment_id,{"user_id":1})
        if comment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not exists")
        
        self.CommentAction.ensure_owner(user_id,comment["user_id"],"You cannot update others' comments")
        
        return await self.CommentAction.updated(comment_id,{"comment":updated_comment})

    async def delete(self,comment_id:str,user_id:str):
        self.CommentAction.validate_object_id(comment_id)
        comment=await self.CommentAction.get_data_by_id(comment_id,{"user_id":1})
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not found")
        
        self.CommentAction.ensure_owner(user_id,comment["user_id"],"You cannot delete others' comments")
        await self.CommentAction.hard_delete(comment_id)


class CommentsActionService:

    def __init__(self):
        self.CommentAction = CommentActions()
        self.CommentReactionAction=CommentReactionActions()
        self.ReportAction=ReportActions()

    async def like(self,comment_id:str,user_id):
        self.CommentAction.validate_object_id(comment_id)
        comment=await self.CommentAction.get_data_by_id(comment_id,{"_id": 1})
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not exists")
        action=await self.CommentReactionAction.react(user_id,comment_id,"like")
        return action
    
    async def dislike(self,comment_id:str,user_id):
        self.CommentAction.validate_object_id(comment_id)
        comment=await self.CommentAction.get_data_by_id(comment_id,{"_id": 1})
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not exists")
        action=await self.CommentReactionAction.react(user_id,comment_id,"dislike")
        return action
    

    async def report(self,comment_id:str,reported_by:str,data: dict):
        
        self.CommentAction.validate_object_id(comment_id)
        comment=await self.CommentAction.get_data_by_id(comment_id,{"user_id":1})
        if comment["user_id"]==reported_by:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you cannot report your own comment")
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="comment does not exist")
        
        data["reported_by"] = ObjectId(reported_by)
        data["reported_comment"] = ObjectId(comment_id)
        data["status"] = "pending"

        try:
            return await self.ReportAction.create(data)

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this comment"
            )
