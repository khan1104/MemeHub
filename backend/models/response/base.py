from pydantic import BaseModel, Field, field_validator
from typing import Optional


class MongoBaseModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid(cls, v):
        return str(v) if v else None

    class Config:
        populate_by_name = True
