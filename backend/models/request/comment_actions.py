from pydantic import BaseModel,Field
class CommentReport(BaseModel):
    reason:str=Field(min_length=5, max_length=50)
    description: str = Field(min_length=5, max_length=350)