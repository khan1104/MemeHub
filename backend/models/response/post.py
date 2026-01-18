from pydantic import BaseModel
from datetime import datetime
from constants.meme_tags import Memetags
from models.response.base import MongoBaseModel
from typing import Optional,List


class CreatedByUser(MongoBaseModel):
    user_name: str
    profile_pic: Optional[str] = None
    email: Optional[str] = None


class MemeResponse(MongoBaseModel):
    caption: str
    media_url: str
    media_type: str
    tags: List[str]
    created_at: datetime
    like_count: int
    dislike_count: int
    created_by: CreatedByUser

class PostResponse(MongoBaseModel):
    created_at:datetime


class PaginatedPostResponse(BaseModel):
    items: List[MemeResponse]
    next_cursor: Optional[str]
    has_next: bool