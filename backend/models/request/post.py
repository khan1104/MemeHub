from pydantic import BaseModel


class UpdateMeme(BaseModel):
    caption:str

