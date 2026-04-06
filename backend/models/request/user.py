from pydantic import BaseModel,Field
from typing import Optional


class UserReport(BaseModel):
    reason:str=Field(min_length=5, max_length=50)
    description: str = Field(min_length=5, max_length=350)


class UserUpdate(BaseModel):
    user_name:Optional[str]=None
    bio: Optional[str]=None

