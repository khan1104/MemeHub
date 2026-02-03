from models.response.base import MongoBaseModel
from pydantic import BaseModel
from datetime import datetime
from typing import Optional,List

class CreatedByUser(MongoBaseModel):
    user_name: str
    profile_pic: str

class CommentResponse(MongoBaseModel):
    created_at:datetime
 

class Comments(MongoBaseModel):
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




