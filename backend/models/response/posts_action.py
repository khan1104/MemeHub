from models.response.base import MongoBaseModel
from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional,List

class CreatedByUser(BaseModel):
    user_id:str
    user_name: str
    profile_pic: str

class CommentResponse(MongoBaseModel):
    created_at:datetime
 

class Comments(BaseModel):
    comment_id:str
    comment: str
    created_at: datetime
    like_count:int
    dislike_count:int
    is_liked: bool=False
    is_disliked: bool=False
    created_by:CreatedByUser


class PaginatedCommentResponse(BaseModel):
    items: List[Comments]
    next_cursor: Optional[str]
    has_next: bool


class SavedPostsResponse(BaseModel):
    post_id:str
    caption:str
    media_url:str
    media_type:str
    like_count:int
    created_at:datetime
    created_by:CreatedByUser


class PaginatedSavedResponse(BaseModel):
    items: List[SavedPostsResponse]
    next_cursor: Optional[str]
    has_next: bool


class LikedPostsResponse(MongoBaseModel):
    post_id:str
    caption:str
    media_url:str
    media_type:str
    like_count:int
    created_at:datetime
    created_by:CreatedByUser

class PaginatedLikedResponse(BaseModel):
    items: List[LikedPostsResponse]
    next_cursor: Optional[str]
    has_next: bool





