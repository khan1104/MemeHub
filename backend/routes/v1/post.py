from fastapi import APIRouter,Form,Depends,status,UploadFile,File,Request,Query
from models.request.post import UpdateMeme
from constants.meme_tags import Memetags
from dependency.auth_dependency import get_current_user
from services.post import PostService
from models.response.post import PostResponse,MemeResponse,PaginatedPostResponse
from typing import List,Optional

route=APIRouter()
service=PostService()

@route.get("/",status_code=status.HTTP_200_OK,response_model=PaginatedPostResponse)
async def getPosts(sort_by:Optional[str]="latest",
                   cursor: Optional[str] = None,user_id: Optional[str] = None,limit: int = 10):
    data=await service.get_all_posts(sort_by=sort_by,cursor=cursor,limit=limit,user_id=user_id)
    print(user_id)
    return data


@route.get("/user/{user_id}",status_code=status.HTTP_200_OK,response_model=PaginatedPostResponse)
async def get_user_posts(user_id:str,sort_by: str = Query("latest", enum=["latest", "top","oldest"]),cursor: Optional[str] = None,limit: int = 10):
    return await service.getUserPosts(sort_by=sort_by,user_id=user_id,cursor=cursor,limit=limit)

@route.get("/{post_id}",status_code=status.HTTP_200_OK,response_model=MemeResponse)
async def get_post_by_id(post_id:str,user_id: Optional[str] = None):
    data=await service.get_post_by_id(post_id=post_id,user_id=user_id)
    return data


@route.post("/", status_code=status.HTTP_201_CREATED,response_model=PostResponse)
async def createPost(
    caption: str = Form(...),
    file: UploadFile = File(...),
    tags: List[Memetags] = Form(..., min_length=1, max_length=3),
    current_user=Depends(get_current_user)
):
    # print(file._in_memory)
    new_post = await service.createPost(caption, file, tags, current_user["_id"])
    return PostResponse(**new_post)

@route.patch("/{post_id}",status_code=status.HTTP_200_OK)
async def updatePost(post_id:str,data:UpdateMeme,current_user=Depends(get_current_user)):
    await service.update_post(post_id,current_user["_id"],data.model_dump())
    return {"message":"post updataed"}

@route.delete("/{post_id}",status_code=status.HTTP_204_NO_CONTENT)
async def deletePost(post_id:str,current_user=Depends(get_current_user)):
    await service.deletePost(post_id,current_user["_id"])