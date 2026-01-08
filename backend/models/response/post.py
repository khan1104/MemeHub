from pydantic import BaseModel
from datetime import datetime
from constants.meme_tags import Memetags
from models.response.base import MongoBaseModel


class CreatedByUser(MongoBaseModel):
    user_name: str
    profile_pic: str

class PostResponse(MongoBaseModel):
    created_at:datetime

class MemeResponse(MongoBaseModel):
    caption:str
    media_url:str
    media_type:str
    tags:list[str]=[]
    created_at:datetime
    like_count:int
    dislike_count:int
    created_by:CreatedByUser


    