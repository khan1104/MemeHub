from pydantic import BaseModel,Field,field_validator
from datetime import datetime

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
    id: str = Field(alias="_id")
    user_one:str
    user_two:str
    created_at:datetime

    @field_validator("id", "user_one","user_two", mode="before")
    @classmethod
    def convert_objectid(cls, v):
        return str(v)
