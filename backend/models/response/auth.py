from pydantic import BaseModel
from models.response.base import MongoBaseModel

class RegisterResponse(MongoBaseModel):
    user_name:str

class OtpResponse(BaseModel):
    otp:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str="Bearer" 

