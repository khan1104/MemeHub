from pydantic import BaseModel

class CommentReport(BaseModel):
    reason:str
    description:str