import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from core.config import settings

SECRET_KEY = settings.JWT_SECRET_KEY
REFRESH_KEY = settings.JWT_REFRESH_KEY
ALGORITHM = settings.ALGORITHM


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire_time = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire_time})
    return jwt.encode(to_encode, REFRESH_KEY, algorithm=ALGORITHM)


def create_token(data: dict):
    to_encode = data.copy()
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire_time})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, is_refresh: bool = False):
    secret = REFRESH_KEY if is_refresh else SECRET_KEY
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
