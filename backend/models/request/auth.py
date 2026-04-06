from pydantic import BaseModel,EmailStr,field_validator,Field
import re


class RegisterUser(BaseModel):
    user_name: str=Field(min_length=4,max_length=12)
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(v) > 12:
            raise ValueError("Password should not be greater than 12 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Must contain one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Must contain one special character")
        return v


class LoginUser(BaseModel):
    email:EmailStr
    password:str

class Otp(BaseModel):
    email:EmailStr


class OtpVerifyData(BaseModel):
    otp:str
    email:EmailStr

class RefreshToken(BaseModel):
    refresh_token:str

class ChangePassword(BaseModel):
    new_password:str
    retype_password:str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(v) > 12:
            raise ValueError("Password should not be greater than 12 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Must contain one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Must contain one special character")
        return v


class GoogleAuthRequest(BaseModel):
    token_id: str