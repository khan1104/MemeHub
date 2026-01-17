from fastapi import APIRouter,Depends,status
from services.comment_actions import CommentService,CommentsActionService
from dependency.auth_dependency import get_current_user
from models.request.posts_action import Comment
from models.request.comment_actions import CommentReport

route=APIRouter()

comment_service=CommentService()
reaction_service=CommentsActionService()

@route.patch("/{comment_id}", status_code=status.HTTP_200_OK)
async def update_comment(comment_id: str, comment: Comment, current_user=Depends(get_current_user)):
    await comment_service.update(comment_id,current_user["_id"],comment.comment)
    return {"message":"comment updated"}

@route.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: str, current_user=Depends(get_current_user)):
    await comment_service.delete(comment_id,current_user["_id"])

@route.post("/like/{comment_id}", status_code=status.HTTP_200_OK)
async def like_comment(comment_id: str, current_user=Depends(get_current_user)):
    action =await reaction_service.like(comment_id, current_user["_id"])
    return action

@route.post("/dislike/{comment_id}", status_code=status.HTTP_200_OK)
async def dislike_comment(comment_id: str, current_user=Depends(get_current_user)):
    action =await reaction_service.dislike(comment_id, current_user["_id"])
    return action

@route.post("/report/{comment_id}", status_code=status.HTTP_200_OK)
async def report_comment(comment_id: str,data:CommentReport, current_user=Depends(get_current_user)):
   await reaction_service.report(comment_id,current_user["_id"],data.model_dump())
   return {"message":"comment reported"}