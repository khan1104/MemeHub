from pydantic import BaseModel


class Comment(BaseModel):
    comment:str


class PostReport(BaseModel):
    reason:str
    description:str