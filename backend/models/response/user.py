from pydantic import EmailStr,BaseModel
from models.response.base import MongoBaseModel
from datetime import datetime


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



class SearchUserResponse(MongoBaseModel):
    user_name:str


class FollowDataResponse(BaseModel):
    user_id:str
    user_name:str
    profile_pic: str
    email: EmailStr
    created_at: datetime

