from pydantic import BaseModel,Field,field_validator
from datetime import datetime
from typing import Optional,List

class RequestResponse(BaseModel):
    id: str = Field(alias="_id")
    requester_id:str
    status:str
    created_at:datetime

    @field_validator("id", "requester_id", mode="before")
    @classmethod
    def convert_objectid(cls, v):
        return str(v)
    
class FriendsResponse(BaseModel):
    friend_id:str
    user_name:str
    profile_pic:str
    email:str
    isFollowing:bool=False
    isFriend:bool=False

    @field_validator("friend_id", mode="before")
    @classmethod
    def convert_objectid(cls, v):
        return str(v)
    
class PaginatedFriendsResponse(BaseModel):
    items: List[FriendsResponse]
    next_cursor: Optional[str]
    has_next: bool
    