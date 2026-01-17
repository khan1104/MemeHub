from pydantic import BaseModel,EmailStr


class RegisterUser(BaseModel):
    user_name:str
    email:EmailStr
    password:str    # should be change for strict rule in future


class LoginUser(BaseModel):
    email:EmailStr
    password:str

class Otp(BaseModel):
    email:EmailStr


class verifyData(BaseModel):
    otp:str
    email:EmailStr

class RefreshToken(BaseModel):
    refresh_token:str

class ChangePassword(BaseModel):
    new_password:str
    retype_password:str


class GoogleAuthRequest(BaseModel):
    token_id: str