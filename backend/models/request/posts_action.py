from pydantic import BaseModel,Field


class Comment(BaseModel):
    comment: str = Field(min_length=1, max_length=250)


class PostReport(BaseModel):
    reason:str=Field(min_length=5, max_length=50)
    description: str = Field(min_length=5, max_length=350)