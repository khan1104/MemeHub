from pydantic import EmailStr
from models.response.base import MongoBaseModel


class UserResponse(MongoBaseModel):
    user_name:str
    email:EmailStr
    profile_pic:str
    bio:str

class SearchUserResponse(MongoBaseModel):
    user_name:str