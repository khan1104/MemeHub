from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import user_collection
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status,Cookie
from utils.authentication import verify_token

security = HTTPBearer()
user_actions = BaseActions(user_collection,True)

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    if token.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
        )

    user_id = verify_token(token.credentials)
    user = await user_actions.get_data_by_id(user_id)
    
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
