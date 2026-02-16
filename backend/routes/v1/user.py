from fastapi import APIRouter,status,Depends,UploadFile,File
from dependency.auth_dependency import get_current_user
from models.response.user import UserResponse,SearchUserResponse,FollowDataResponse
from services.user import UserService
from models.request.user import UserReport,UserUpdate


route=APIRouter()
service=UserService()
print("instance bana instnace bana")

@route.get("/",status_code=status.HTTP_200_OK,response_model=list[UserResponse])
async def getUsers():
    data=await service.getAllUsers()
    return data

@route.get("/search",status_code=status.HTTP_200_OK, response_model=list[SearchUserResponse])
async def search_users(q: str):
    return await service.search_users(q)

@route.get("/me",status_code=status.HTTP_200_OK,response_model=UserResponse)
async def get_current_user(current_user=Depends(get_current_user)):
    data=await service.getCurrentUser(current_user["_id"])
    return data



@route.get("/{user_id}",status_code=status.HTTP_200_OK,response_model=UserResponse)
async def get_user_by_id(user_id:str,current_user_id:str|None = None):
    data=await service.get_user_by_id(user_id,current_user_id)
    return data

@route.patch("/me/info",status_code=status.HTTP_200_OK)
async def update(data:UserUpdate,current_user=Depends(get_current_user)):
    await service.upadteUser(current_user["_id"],data.model_dump(exclude_none=True))
    return {"message":"user updataed"}

@route.patch("/me/profile-pic",status_code=status.HTTP_200_OK)
async def upadte_profile_pic(profile_pic: UploadFile = File(...),current_user=Depends(get_current_user)):
    print("endpoint call")
    await service.updateProfilePic(current_user["_id"],profile_pic)


@route.delete("/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
async def deleteUser(user_id:str):
    await service.deleteUser(user_id)

@route.post("/follow/{user_id}", status_code=status.HTTP_200_OK)
async def follow(user_id: str, current_user=Depends(get_current_user)):
    data =await service.follow(user_id, current_user["_id"])
    return data

@route.get("/followers/{user_id}",status_code=status.HTTP_200_OK,response_model=list[FollowDataResponse])
async def get_followers(user_id:str,cursor: str|None = None,limit: int = 10):
    return await service.get_followers(user_id=user_id)
    

@route.get("/followings/{user_id}",status_code=status.HTTP_200_OK,response_model=list[FollowDataResponse])
async def get_followings(user_id:str,cursor: str|None = None,limit: int = 10):
    return await service.get_followings(user_id=user_id)
   


@route.post("/report{user_id}", status_code=status.HTTP_201_CREATED)
async def report(user_id: str, data: UserReport, current_user=Depends(get_current_user)):
    await service.report(user_id,current_user["_id"],data.model_dump())
    return {"message": "user reported successfully"}

@route.post("/top")
async def get_monthly_top_users():
    data=await  service.get_monthly_top_users()
    print(data)



