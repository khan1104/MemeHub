from pydantic import BaseModel,Field,field_validator
from datetime import datetime
from typing import Optional,List

class RequestResponse(BaseModel):
    id: str 
    user_id:str
    user_name:str
    profile_pic:str
    created_at:datetime



# class SentRequestResponse(BaseModel):
#     id: str = Field(alias="_id")
#     recipient_id:str
#     status:str
#     created_at:datetime

#     @field_validator("id", "recipient_id", mode="before")
#     @classmethod
#     def convert_objectid(cls, v):
#         return str(v)
    
class FriendsResponse(BaseModel):
    user_id:str
    user_name:str
    profile_pic:str
    isFollowing:bool=False
    isFriend:bool=False
    created_at:datetime
    
class PaginatedFriendsResponse(BaseModel):
    items: List[FriendsResponse]
    next_cursor: Optional[str]
    has_next: bool


class PaginatedRequestsResponse(BaseModel):
    items: List[RequestResponse]
    next_cursor: Optional[str]
    has_next: bool
    