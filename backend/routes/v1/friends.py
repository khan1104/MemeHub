from fastapi import APIRouter, status, Depends, Query,Request
from dependency.auth_dependency import get_current_user
from services.friends import FriendService
from models.response.friends import PaginatedFriendsResponse,PaginatedRequestsResponse
from constants.requestStatus import FriendRequestStatus
from typing import Optional
from core.rateLimiter import limiter

route = APIRouter()
service = FriendService()

@route.post("/request/{user_id}", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def send_friend_request(request:Request,user_id: str, current_user=Depends(get_current_user)):
    await service.send_friend_request(user_id, current_user["_id"])
    return {"message": "Friend request sent"}

@route.put("/request/{request_id}",status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def handle_friend_request(
    request:Request,
    request_id: str,
    # action: str = Query(..., regex="^(accept|reject)$"),
    action:FriendRequestStatus,
    current_user=Depends(get_current_user)
):

    await service.handle_friend_request(request_id, current_user["_id"], action)
    return {"message": f"Request {action}ed"}

@route.get("/requests",status_code=status.HTTP_200_OK,response_model=PaginatedRequestsResponse)
@limiter.limit("4/second")
async def get_requests(request:Request,current_user=Depends(get_current_user),cursor: Optional[str] = None,limit: int = 12):
    data =await service.get_requests(current_user_id=current_user["_id"],type="get",cursor=cursor,limit=limit)
    return data

@route.get("/sent-requests",status_code=status.HTTP_200_OK,response_model=PaginatedRequestsResponse)
@limiter.limit("4/second")
async def get_sent_requets(request:Request,current_user=Depends(get_current_user),cursor: Optional[str] = None,limit: int = 12):
    data =await service.get_requests(current_user_id=current_user["_id"],type="sent",cursor=cursor,limit=limit)
    return data

@route.delete("/requests/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def cancel_request(request:Request,user_id: str, current_user=Depends(get_current_user)):
    await service.cancel_request(user_id, current_user["_id"])
    return {"message": "Friend request cancelled"}


@route.delete("/friends/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def remove_friend(request:Request,user_id: str, current_user=Depends(get_current_user)):
    await service.remove_friend(user_id,current_user["_id"])
    return {"message": "Friend removed"}

@route.get("/friends/{user_id}",status_code=status.HTTP_200_OK,response_model=PaginatedFriendsResponse)
@limiter.limit("4/second")
async def get_friends(request:Request,user_id:str,current_user=Depends(get_current_user),
    sort_by: str = Query("latest", enum=["latest","oldest"]),cursor: Optional[str] = None,limit: int = 12):
    data =await service.get_friends(user_id=user_id,logged_in_user_id=current_user["_id"],sort_by=sort_by,cursor=cursor,limit=limit)
    return data

@route.get("/mutual-friends/{user_id}",status_code=status.HTTP_200_OK,response_model=PaginatedFriendsResponse)
@limiter.limit("4/second")
async def get_mutual_friends(request:Request,user_id:str,current_user=Depends(get_current_user),cursor: Optional[str] = None,limit: int = 12):
    data =await service.get_mutual_friends(user_id=user_id,logged_in_user_id=current_user["_id"],cursor=cursor,limit=limit)
    return data
