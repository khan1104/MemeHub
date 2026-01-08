from fastapi import status,HTTPException
from utils.upload_to_bucket import upload_to_bucket
from database.mongoDB.actions.post import PostAction
from core.config import settings


class PostService:
    def __init__(self):
        self.PostActions=PostAction()

    async def get_all_posts(self,sort_by: str):
        return await self.PostActions.get_all_with_user(sort_by=sort_by)
    
    async def get_post_by_id(self,post_id:str):
        return await self.PostActions.get_all_with_user(post_id=post_id)
    
    async def get_current_user_posts(self,sort_by: str,current_user_id:str):
        posts=await self.PostActions.get_all_with_user(sort_by=sort_by,filter={"created_by":current_user_id})
        return posts

    async def createPost(self, caption: str, media_file, tags, current_user_id: str):
        file_ext = media_file.filename.split(".")[-1].lower()

        ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png"}
        ALLOWED_VIDEO_EXT = {"mp4", "mov", "webm"}

        if file_ext in ALLOWED_IMAGE_EXT:
            media_type = "image"

        elif file_ext in ALLOWED_VIDEO_EXT:
            media_type = "video"

        else:
            raise HTTPException(400, f"Unsupported file type '{file_ext}'")

        url = await upload_to_bucket(
            bucket=settings.POSTS_BUCKET,
            file=media_file,  # FIXED
            file_ext=file_ext,
        )

        data = {
            "created_by": current_user_id,
            "caption": caption,
            "media_url": url,
            "tags": tags,
            "media_type": media_type
        }

        return await self.PostActions.create(data)
    
    async def update_post(self,post_id:str,user_id:str,updateData:dict):
        self.PostActions.validate_object_id(post_id)
        post=await self.PostActions.get_data_by_id(post_id,{"created_by":1})
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Post not exists")
        
        self.PostActions.ensure_owner(post["created_by"],user_id,"you can't update others posts")
        
        return await self.PostActions.updated(post_id, {"caption": updateData.get("caption")})
        
    async def deletePost(self,post_id:str,user_id:str):
        self.PostActions.validate_object_id(post_id)
        post=await self.PostActions.get_data_by_id(post_id,{"created_by":1})
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Post not exists")
        
        self.PostActions.ensure_owner(post["created_by"],user_id,"you can't delete others posts")
        await self.PostActions.hard_delete(post_id)
        



