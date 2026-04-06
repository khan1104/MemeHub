from fastapi import HTTPException,status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.comment_actions import CommentActions,CommentReactionActions,ReportActions
from database.mongoDB.actions.post import PostAction


class CommentService:

    def __init__(self):
        self.comment_actions = CommentActions()
        self.post_actions=PostAction()

    async def get_comments(self,post_id:str,user_id:str,sort_by:str,cursor:str,limit:str):

        self.comment_actions.validate_object_id(post_id)
        post=await self.post_actions.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Post not found")
        
        data=await self.comment_actions.get_comments(post_id,sort_by,cursor,limit,user_id)
        return data
    
    async def add_comment(self,post_id:str,user_id:str,comment:str):
        self.comment_actions.validate_object_id(post_id)
        post=await self.post_actions.get_data_by_id(post_id,{"_id": 1})
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Post not found")
        action=await self.comment_actions.create({"user_id":user_id,"post_id":ObjectId(post_id),"comment":comment})
        return action
    
    async def update(self,comment_id:str,user_id:str,updated_comment:str):
        self.comment_actions.validate_object_id(comment_id)
        comment=await self.comment_actions.get_data_by_id(comment_id,{"user_id":1})
        if comment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not exists")
        
        self.comment_actions.ensure_owner(user_id,comment["user_id"],"You cannot update others' comments")
        
        return await self.comment_actions.updated(comment_id,{"comment":updated_comment})

    async def delete(self,comment_id:str,user_id:str):
        self.comment_actions.validate_object_id(comment_id)
        comment=await self.comment_actions.get_data_by_id(comment_id,{"user_id":1})
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not found")
        
        self.comment_actions.ensure_owner(user_id,comment["user_id"],"You cannot delete others' comments")
        await self.comment_actions.hard_delete(comment_id)


class CommentsActionService:

    def __init__(self):
        self.comment_actions = CommentActions()
        self.comment_reaction_actions=CommentReactionActions()
        self.report_actions=ReportActions()

    async def like(self,comment_id:str,user_id):
        self.comment_actions.validate_object_id(comment_id)
        comment=await self.comment_actions.get_data_by_id(comment_id,{"_id": 1})
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not exists")
        action=await self.comment_reaction_actions.react(user_id,comment_id,"like")
        return action
    
    async def dislike(self,comment_id:str,user_id):
        self.comment_actions.validate_object_id(comment_id)
        comment=await self.comment_actions.get_data_by_id(comment_id,{"_id": 1})
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="comment not exists")
        action=await self.comment_reaction_actions.react(user_id,comment_id,"dislike")
        return action
    

    async def report(self,comment_id:str,reported_by:str,data: dict):
        
        self.comment_actions.validate_object_id(comment_id)
        comment=await self.comment_actions.get_data_by_id(comment_id,{"user_id":1})
        if comment["user_id"]==reported_by:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you cannot report your own comment")
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="comment does not exist")
        
        data["reported_by"] = ObjectId(reported_by)
        data["reported_comment"] = ObjectId(comment_id)
        data["status"] = "pending"

        try:
            return await self.report_actions.create(data)

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this comment"
            )
