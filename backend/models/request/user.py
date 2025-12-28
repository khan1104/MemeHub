from pydantic import BaseModel
from typing import Optional


class UserReport(BaseModel):
    reason: str
    description: str


class UserUpdate(BaseModel):
    user_name:Optional[str]=None
    bio: Optional[str]=None

