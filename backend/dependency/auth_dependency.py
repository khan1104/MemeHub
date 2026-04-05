from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import user_collection
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status,Cookie
from utils.authentication import verify_token
from typing import Optional

user_actions = BaseActions(user_collection,True)
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
):
    user_id = verify_token(token.credentials)
    user = await user_actions.get_data_by_id(user_id)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


async def get_current_user_optional(
    token: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
):
    if not token:
        return None

    try:
        user_id = verify_token(token.credentials)
        return await user_actions.get_data_by_id(user_id)
    except Exception:
        return None