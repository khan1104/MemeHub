from pydantic import BaseModel, Field, field_validator

class MongoBaseModel(BaseModel):
    id: str = Field(alias="_id")

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid(cls, v):
        return str(v)

    class Config:
        populate_by_name = True 
