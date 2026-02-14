from fastapi import APIRouter, status, Depends, Query
from dependency.auth_dependency import get_current_user
from services.friends import FriendService
from models.response.friends import RequestResponse,FriendsResponse,PaginatedFriendsResponse
from constants.requestStatus import FriendRequestStatus
from typing import Optional

route = APIRouter()
service = FriendService()

@route.post("/request/{user_id}", status_code=status.HTTP_201_CREATED)
async def send_friend_request(user_id: str, current_user=Depends(get_current_user)):
    await service.send_friend_request(user_id, current_user["_id"])
    return {"message": "Friend request sent"}

@route.put("/request/{request_id}",status_code=status.HTTP_200_OK)
async def handle_friend_request(
    request_id: str,
    # action: str = Query(..., regex="^(accept|reject)$"),
    action:FriendRequestStatus,
    current_user=Depends(get_current_user)
):
    await service.handle_friend_request(request_id, current_user["_id"], action)
    return {"message": f"Request {action}ed"}

@route.get("/request",status_code=status.HTTP_200_OK,response_model=list[RequestResponse])
async def get_requests(current_user=Depends(get_current_user)):
    data =await service.get_requests(current_user["_id"])
    return data

@route.delete("/requests/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
async def cancel_request(user_id: str, current_user=Depends(get_current_user)):
    await service.cancel_request(user_id, current_user["_id"])
    return {"message": "Friend request cancelled"}


@route.delete("/friends/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
async def remove_friend(user_id: str, current_user=Depends(get_current_user)):
    await service.remove_friend(user_id,current_user["_id"])
    return {"message": "Friend removed"}

@route.get("/friends/{user_id}",status_code=status.HTTP_200_OK,response_model=PaginatedFriendsResponse)
async def get_friends(user_id:str,current_user=Depends(get_current_user),
        sort_by: str = Query("latest", enum=["latest","oldest"]),cursor: Optional[str] = None,limit: int = 12):
    data =await service.get_friends(user_id=user_id,logged_in_user_id=current_user["_id"],sort_by=sort_by,cursor=cursor,limit=limit)
    return data

@route.get("/mutual-friends/{user_id}",status_code=status.HTTP_200_OK,response_model=PaginatedFriendsResponse)
async def get_mutual_friends(user_id:str,current_user=Depends(get_current_user),cursor: Optional[str] = None,limit: int = 12):
    data =await service.get_mutual_friends(user_id=user_id,logged_in_user_id=current_user["_id"],cursor=cursor,limit=limit)
    return data
