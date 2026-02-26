from fastapi import APIRouter,Depends,status,Query
from services.posts_action import PostActionService
from dependency.auth_dependency import get_current_user
from models.request.posts_action import Comment,PostReport
from models.response.posts_action import CommentResponse,Comments,PaginatedCommentResponse,SavedPostsResponse,LikedPostsResponse
from models.response.post import PaginatedPostResponse
from services.comment_actions import CommentService
from typing import Optional



route=APIRouter()
reaction_service=PostActionService()
comment_service=CommentService()


@route.post("/like/{post_id}",status_code=status.HTTP_200_OK)
async def like(post_id: str, current_user=Depends(get_current_user)):
    return await reaction_service.like(post_id,current_user["_id"])

@route.get("/liked",status_code=status.HTTP_200_OK,response_model=list[LikedPostsResponse])
async def get_liked_posts(current_user=Depends(get_current_user),cursor:str|None=None,limit:int=10):
    return await reaction_service.get_likedPosts(user_id=current_user["_id"],cursor=cursor,limit=limit)


@route.post("/dislike/{post_id}",status_code=status.HTTP_200_OK)
async def dislike(post_id: str, current_user=Depends(get_current_user)):
    return await reaction_service.dislike(post_id,current_user["_id"])


@route.post("/report/{post_id}",status_code=status.HTTP_200_OK)
async def report(post_id: str, data: PostReport, current_user=Depends(get_current_user)):
    await reaction_service.report(post_id,current_user["_id"],data.model_dump())
    return {"message": "Post reported successfully"}

@route.get("/save",status_code=status.HTTP_200_OK,response_model=list[SavedPostsResponse])
async def get_saved_posts(current_user=Depends(get_current_user),cursor:str|None=None,limit:int=10):
    data=await reaction_service.get_saved_posts(user_id=current_user["_id"],cursor=cursor,limit=limit)
    return data
    

@route.post("/save/{post_id}",status_code=status.HTTP_201_CREATED)
async def save(post_id:str,current_user=Depends(get_current_user)):
    return await reaction_service.save(post_id=post_id,saved_by=current_user["_id"])



@route.get("/comments/{post_id}", status_code=status.HTTP_200_OK, response_model=PaginatedCommentResponse)
async def get_comments(post_id: str,user_id: Optional[str] = None, sort_by: str = Query("latest", enum=["latest", "top"]),cursor: Optional[str] = None,limit: int = 1):
    data =await comment_service.get_comments(post_id=post_id,user_id=user_id, sort_by=sort_by,cursor=cursor,limit=limit)
    return data

@route.post("/comment/{post_id}", status_code=status.HTTP_200_OK, response_model=CommentResponse)
async def comment(post_id: str, comment: Comment, current_user=Depends(get_current_user)):
    action =await comment_service.add_comment(post_id,current_user["_id"],comment.comment)
    return CommentResponse(**action)
