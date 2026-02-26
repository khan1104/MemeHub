from pydantic import BaseModel
from datetime import datetime
from constants.meme_tags import Memetags
from models.response.base import MongoBaseModel
from typing import Optional,List


class CreatedByUser(BaseModel):
    user_id:str
    user_name: str
    profile_pic: Optional[str] = None


class MemeResponse(BaseModel):
    post_id:str
    caption: str
    media_url: str
    media_type: str
    tags: List[str]
    created_at: datetime
    like_count: int=0
    dislike_count: int=0
    total_comments:int=0
    is_liked:bool=False
    is_disliked:bool=False
    is_saved:bool=False
    created_by: CreatedByUser

class PostResponse(MongoBaseModel):
    created_at:datetime


class PaginatedPostResponse(BaseModel):
    items: List[MemeResponse]
    next_cursor: Optional[str]
    has_next: bool