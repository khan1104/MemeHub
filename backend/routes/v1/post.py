from fastapi import APIRouter,Form,Depends,status,UploadFile,File
from models.request.post import Meme,UpdateMeme
from constants.meme_tags import Memetags
from dependency.auth_dependency import get_current_user
from services.post import PostService
from models.response.post import PostResponse,MemeResponse

route=APIRouter()
service=PostService()

@route.get("/",status_code=status.HTTP_200_OK,response_model=list[MemeResponse])
async def getPosts(sort_by: str = "latest"):
    data=await service.get_all_posts(sort_by)
    return data

@route.get("/{post_id}",status_code=status.HTTP_200_OK,response_model=MemeResponse)
async def get_post_by_id(post_id:str):
    data=await service.get_post_by_id(post_id)
    return data

@route.get("/me",status_code=status.HTTP_200_OK,response_model=list[MemeResponse])
async def get_current_user_posts(sort_by: str = "latest",current_user=Depends(get_current_user)):
    posts=await service.get_current_user_posts(sort_by,current_user["_id"])
    return posts

@route.post("/", status_code=status.HTTP_201_CREATED)
async def createPost(
    caption: str = Form(...),
    file: UploadFile = File(...),
    tags: list[Memetags] = Form(...),
    current_user=Depends(get_current_user)
):
    new_post = await service.createPost(caption, file, tags, current_user["_id"])
    print(new_post)
    return {"message":"post is created"}

@route.patch("/{post_id}",status_code=status.HTTP_200_OK)
async def updatePost(post_id:str,data:UpdateMeme,current_user=Depends(get_current_user)):
    await service.update_post(post_id,current_user["_id"],data.model_dump())
    return {"message":"post updataed"}

@route.delete("/{post_id}",status_code=status.HTTP_204_NO_CONTENT)
async def deletePost(post_id:str,current_user=Depends(get_current_user)):
    await service.deletePost(post_id,current_user["_id"])