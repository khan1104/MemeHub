from fastapi import APIRouter,Depends,status
from services.posts_action import PostActionService
from dependency.auth_dependency import get_current_user
from models.request.posts_action import Comment,PostReport
from models.response.posts_action import CommentResponse,Comments
from services.comment_actions import CommentService



route=APIRouter()
reaction_service=PostActionService()
comment_service=CommentService()


@route.post("/like/{post_id}",status_code=status.HTTP_200_OK)
async def like(post_id: str, current_user=Depends(get_current_user)):
    return await reaction_service.like(post_id,current_user["_id"])


@route.post("/dislike/{post_id}",status_code=status.HTTP_200_OK)
async def dislike(post_id: str, current_user=Depends(get_current_user)):
    return await reaction_service.dislike(post_id,current_user["_id"])


@route.post("/report{post_id}",status_code=status.HTTP_200_OK)
async def report(post_id: str, data: PostReport, current_user=Depends(get_current_user)):
    await reaction_service.report(post_id,current_user["_id"],data.model_dump())
    return {"message": "Post reported successfully"}


@route.get("/comments/{post_id}", status_code=status.HTTP_200_OK, response_model=list[Comments])
async def get_comments(post_id: str, sort_by: str = "latest"):
    data =await comment_service.get_comments(post_id, sort_by)
    return data

@route.post("/comment/{post_id}", status_code=status.HTTP_200_OK, response_model=CommentResponse)
async def comment(post_id: str, comment: Comment, current_user=Depends(get_current_user)):
    action =await comment_service.add_comment(post_id,current_user["_id"],comment.comment)
    return CommentResponse(**action)
