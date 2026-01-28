from pydantic import EmailStr
from models.response.base import MongoBaseModel
from datetime import datetime


class UserResponse(MongoBaseModel):
    user_name:str
    email:EmailStr
    profile_pic:str
    bio:str
    created_at:datetime
    total_posts:int
    total_followers:int
    total_following:int
    total_friends:int
    isFollowing:bool




class SearchUserResponse(MongoBaseModel):
    user_name:str

