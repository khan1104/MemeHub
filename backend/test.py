from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr, field_validator
import re

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Pulling the 'msg' which corresponds to your 'raise ValueError("...")' messages
    error_messages = [err.get("msg") for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"errors": error_messages},
    )

class Data(BaseModel):
    name: str = Field(min_length=2, max_length=10)
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain one uppercase letter")
        # ... rest of your regex checks
        return v

@app.post("/test")
def test_data(data: Data):
    return {"message": "Success", "user": data.name}