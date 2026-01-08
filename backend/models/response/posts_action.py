from models.response.base import MongoBaseModel
from datetime import datetime

class CreatedByUser(MongoBaseModel):
    user_name: str
    profile_pic: str

class CommentResponse(MongoBaseModel):
    created_at:datetime
 

class Comments(MongoBaseModel):
    comment: str
    created_at: datetime
    like_count:int
    dislike_count:int
    created_by:CreatedByUser




