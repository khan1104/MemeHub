from pydantic import EmailStr,BaseModel
from models.response.base import MongoBaseModel
from datetime import datetime
from typing import Optional,List


class UserResponse(BaseModel):
    user_id:str
    user_name:str
    profile_pic:str
    email:EmailStr
    bio:str
    created_at:datetime
    total_posts:int
    total_followers:int
    total_following:int
    total_friends:int
    isFollowing:bool=False
    isFriend:bool=False
    isRequestSent:bool=False



class SearchUserResponse(MongoBaseModel):
    user_name:str
    profile_pic:str


class FollowDataResponse(BaseModel):
    user_id:str
    user_name:str
    profile_pic: str
    isFollowing: bool=False
    isFriend: bool=False
    created_at: datetime


class PaginatedFollowDataResponse(BaseModel):
    items: List[FollowDataResponse]
    next_cursor: Optional[str]
    has_next: bool

