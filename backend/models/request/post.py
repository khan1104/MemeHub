from pydantic import BaseModel
from constants.meme_tags import Memetags

# class Meme(BaseModel):
#     caption:str
#     media_url:str
#     media_type:str
#     tags:list[Memetags]=[]

class UpdateMeme(BaseModel):
    caption:str

