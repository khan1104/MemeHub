# from pymongo import MongoClient
# from pymongo.collection import Collection
# from bson import ObjectId
# from fastapi import FastAPI
# from pydantic import BaseModel,Field, field_validator
# import uvicorn


# app=FastAPI()

# client=MongoClient("mongodb://localhost:27017/")

# dev_database=client["Memes_test"]
# user_collection=dev_database["users"]
# meme_collection=dev_database["memes"]


# class CrudActions:
#     def __init__(self,collection:Collection):
#         self.collection=collection

#     def create(self, data: dict):
#         result = self.collection.insert_one(data)
#         data["id"] = str(result.inserted_id)
#         return data
    
#     def get_data_by_id(self, id: str):
#         doc = self.collection.find_one({
#             "_id": ObjectId(id),
#             "is_deleted": False
#         })
#         if doc:
#             doc["id"] = str(doc["_id"])
#         return doc

#     def get_all(self):
#         docs = self.collection.find()
#         return [{**doc, "id": str(doc["_id"])} for doc in docs]

# class UserServices:
#     def __init__(self):
#         self.Actions=CrudActions(user_collection)

#     def create_user(self,data):
#         action=self.Actions.create(data)
#         return action

#     def get_user(self):
#         result=self.Actions.get_all()
#         return result
    
# class MemeServices:
#     def __init__(self):
#         self.Actions=CrudActions(meme_collection)

#     def create_meme(self,data):
#         action=self.Actions.create(data)
#         return action

#     def get_meme(self):
#         result=self.Actions.get_all()
#         return result
    

# class Users(BaseModel):
#     name:str
#     email:str
#     password:str

# class Memes(BaseModel):
#     title:str
#     caption:str
#     media_url:str

# class MongoBaseModel(BaseModel):
#     id: str = Field(alias="_id")

#     @field_validator("id", mode="before")
#     @classmethod
#     def convert_objectid(cls, v):
#         return str(v)

#     class Config:
#         populate_by_name = True 

# class UserResponse(MongoBaseModel):
#     name:str

# class MemeResponse(MongoBaseModel):
#     title:str
#     caption:str


# @app.get("/")
# def health():
#     return {"message":"server is healthy and fine"}

# @app.get("/users",response_model=list[UserResponse])
# def get_users():
#     users=UserServices().get_user()
#     return users

# @app.post("/user",response_model=UserResponse)
# def create_user(data:Users):
#     result=UserServices().create_user(data.model_dump())
#     return result

# @app.get("/memes",response_model=list[MemeResponse])
# def get_memes():
#     users=MemeServices().get_meme()
#     return users

# @app.post("/memes",response_model=MemeResponse)
# def create_memes(data:Memes):
#     result=UserServices().create_user(data.model_dump())
#     return result



# # print("enter 1 for create user \n 2 for get users \n 3 for create meme \n 4 for get meme")
# # while True:
# #     option=int(input("enter your choise"))
# #     if option==1:
# #         name=input("enter the name:")
# #         email=input("enter the email:")
# #         password=input("enter the password:")
# #         data={"name":name,"email":email,"password":password}
# #         create_user(data)
# #         print("data inserted")
    
# #     elif option==2:
# #         result=get_user()
# #         print(result)

# #     elif option==3:
# #         title=input("enter the title:")
# #         description=input("enter the description:")
# #         data={"title":title,"description":description}
# #         create_meme(data)
# #         print("data inserted")
    
# #     elif option==4:
# #         result=get_meme()
# #         print(result)

# #     elif option==5:
# #         break

# #     else:
# #         print("wrong option")




# # a=False

# # if not a:
# #     print("hello")
# # else:
# #     print("basd")

# # def main(a:int,b:int=2):
# #     print(a)
# #     print(b)


# # main(1,5)
# # memory=[]

# # def add(email,otp):
# #     data={"email":email,"otp":otp}
# #     memory.append(data)

# # def check(email,opt):
# #     for data in memory:
# #         if data["email"]==email and data["otp"]==opt:
# #             print("right")
# #         else:
# #             print("wrong")
            

# # add("legend","233")
# # add("aman","123")
# # add("sahil","234")
# # check("sahil","567")

# # print(memory)

# # from fastapi import FastAPI
# # from pydantic import BaseModel

# # app = FastAPI()

# # # ✅ Step 1: Create a response schema
# # class UserResponse(BaseModel):
# #     id: int
# #     name: str
# #     email: str

# # # ✅ Step 2: Use response_model parameter
# # @app.get("/user/{user_id}", response_model=UserResponse)
# # def get_user(user_id: int):
# #     id=1
# #     name="legend"
# #     email="khan@gmail.com"
# #     return id,name,email


# # app = FastAPI()


# # @app.post('/user')
# # async def add_user(name:str,email:str,password:str):
# #     user=await Users.findOne({"email":email})
# #     if user:
# #         print("user aleady present")

# #     await Users.create({"name":name,"emial":email,"password":password})
# #     print("user added")

# # @app.post('/user')
# # def add_user(name:str,email:str,password:str):
# #     user=Users.findOne({"email":email})
# #     if user:
# #         print("user aleady present")

# #     Users.create({"name":name,"emial":email,"password":password})
# #     print("user added")

# from fastapi import FastAPI,Request,UploadFile,File
# import uvicorn
# from pydantic import BaseModel


# class Data(BaseModel):
#     name:str
#     surname:str
#     roll_no:int



# import time

# app=FastAPI()


# @app.post("/get")
# def health(user_data:Data,request:Request):
#     print(request.headers.get("content-length"))
#     return {"message":"server is healthy and running fine"}

# @app.post("/uploadfile/")
# async def create_upload_file(file: UploadFile):
#     print(file.size)
#     print(file.headers)
#     return {"filename": file.filename}

# @app.post("/")
# async def createPost(
#     file: UploadFile = File(...),
  
# ):
#     print(file.size)
#     return {"filename": file.filename}

from fastapi import FastAPI, File, UploadFile
import uvicorn

app = FastAPI()


# @app.post("/files/")
# async def create_file(file: bytes = File()): # read the all Bytes(content) of the file in the RAM 
#     return {"filename": file.filename}


# @app.post("/uploadfile/")
# async def create_upload_file(file: UploadFile): # read the file upto certain limit first so that RAM not overwelmed
#     return {"filename": file.filename}

# @app.post("/uploadfile/")
# async def create_upload_file(file: UploadFile=File(...)): # file is requred 
#     return {"filename": file.filename}

# async def handle_file(file: UploadFile):
#     size2=file.size
#     print(size2)

# async def handle_file(file: UploadFile):
#     contents = await file.read()
#     size1 = len(contents)
#     print(size1)
    
# async def handle_file(file: UploadFile):
#     file.file.seek(0, 2)  # move to end
#     size = file.file.tell()
#     file.file.seek(0)     # reset pointer
#     print(size)

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile=File()): # file is optional
    # await handle_file(file)
    size=file_size = (file.file.seek(0, 2), file.file.tell(), file.file.seek(0))[1]
    print(size)
    return {"filename": file.filename}

if __name__=="__main__":
    uvicorn.run("test:app",reload=True)
# # from fastapi import FastAPI

# # import time

# # app = FastAPI()

# # @app.get("/get")
# # def endpoint():
# #     print("hello")
# #     time.sleep(10)
# #     print("bye")


# data={"name":"hello","kas":"about"}
# print(data.items())
# for k,v in data.items():
#     print(k,v)


# data="hello"

# def pri():
#     print(data)

# pri()
# from bson import ObjectId

# def check(data:ObjectId):
#     print(data)
# check(1)



#types of way we can get data in fastAPI endpoints
# from fastapi import FastAPI,Form, File, UploadFile,Header, Cookie
# from pydantic import BaseModel
# app = FastAPI()

#1--> using path parameters
# Data embedded directly within the URL path
# by adding {parameter_name} in the path decorator and defining a corresponding function parameter with type hints
# @app.get("/items/{item_id}")
# async def read_item(item_id: int):
#     return {"item_id": item_id}   

#2--> using quey parameters
# Data passed as key-value pairs in the URL after a ?
# Declared as optional function parameters with type hints
# @app.get("/items/")
# async def read_items(skip: int = 0, limit: int = 10):
#     return {"skip": skip, "limit": limit}


#3--> using request body
# Data sent in the body of the request
# Defined by declaring a function parameter with a Pydantic BaseModel type.
# class Item(BaseModel):
#     name: str
#     description: str | None = None
#     price: float
#     tax: float | None = None

# @app.post("/items/")
# async def create_item(item: Item):
#     return item

#4--> using form data
# Data sent with Content-Type: application/x-www-form-urlencoded or multipart/form-data
# mostly used when we nees some files or documents.
# @app.post("/login/")
# async def login(username: str = Form(), password: str = Form()):
#     return {"username": username,"password":password}

# @app.post("/uploadfile/")
# async def create_upload_file(file: UploadFile):
#     return {"filename": file.filename, "content_type": file.content_type}


#6--> using #4--> using form data
# Access specific HTTP headers or cookies using Header() and Cookie() respectively

# 


# try:
#     # a=0
#     # b=10
#     # result=b/a
#     print(jello)

# except Exception as ZeroDivisionError:
#     print("eror")

# except Exception as e:
#     print(e)






# from supabase import create_client
# import uuid
# from fastapi import HTTPException,status
# import magic
# from core.config import settings

# MAX_IMAGE_SIZE = 5 * 1024 * 1024      # 5 MB
# MAX_VIDEO_SIZE = 50 * 1024 * 1024     # 50 MB

# ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png"}
# ALLOWED_VIDEO_EXT = {"mp4", "mov", "webm"}

# SUPABASE_URL = settings.SUPABASE_URL
# SUPABASE_KEY = settings.SUPABASE_KEY

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# def validate_magic_bytes(file_bytes, expected_type):
#     mime = magic.from_buffer(file_bytes[:2048], mime=True)
#     print(mime)

#     if expected_type == "image" and not mime.startswith("image/"):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Invalid image file. MIME detected: {mime}")

#     if expected_type == "video" and not mime.startswith("video/"):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Invalid video file. MIME detected: {mime}")


# async def upload_to_bucket(bucket: str, file, file_ext: str) -> str:
#     try:
#         file_bytes =await file.read()
#         file_size = len(file_bytes)
#         file_ext = file_ext.lower()

#         if file_ext in ALLOWED_IMAGE_EXT:
#             media_type = "image"
#             if file_size > MAX_IMAGE_SIZE:
#                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Image too large (max {MAX_IMAGE_SIZE / 1024 / 1024} MB)")
        
#         elif file_ext in ALLOWED_VIDEO_EXT:
#             media_type = "video"
#             if file_size > MAX_VIDEO_SIZE:
#                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Video too large (max {MAX_VIDEO_SIZE / 1024 / 1024} MB)")

#         else:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Unsupported file extension '{file_ext}'")

#         # Magic Byte Validation
#         validate_magic_bytes(file_bytes, media_type)

#         if bucket == "profile_pics":
#             file_name = f"users_profile_pics/{uuid.uuid4()}.{file_ext}"

#         elif bucket == "users_posts":
#             folder = "images" if media_type == "image" else "videos"
#             file_name = f"{folder}/{uuid.uuid4()}.{file_ext}"

#         else:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Invalid bucket name '{bucket}'")

#         content_type = f"{media_type}/{file_ext}"

#         response = supabase.storage.from_(bucket).upload(
#             file_name,
#             file_bytes,
#             {"contentType": content_type}
#         )
#         if not response.path:
#             raise HTTPException(500, "Upload failed")

#         url = supabase.storage.from_(bucket).get_public_url(file_name)
#         return url
#         # fake_url="https://cdn.mastmeme.com/default_profile.png"
#         # return fake_url

#     except Exception as e:
#         raise HTTPException(500, str(e))

# from fastapi import FastAPI,Form, File, UploadFile,Header, Cookie
# from pydantic import BaseModel
# app = FastAPI()



# @app.get("/test")
# def test(value: str = Header(None)): # Cookie ki jagah Header use karein
#     return {"received_value": value}

from fastapi import FastAPI, Query
from typing import List, Dict

app = FastAPI()

# A simple in-memory list of data
fake_db = [{"id": i, "name": f"Item {i}"} for i in range(1, 101)]

@app.get("/items_manual", response_model=List[Dict])
def get_items_manual(
    limit: int = Query(10, ge=1, le=100), # Max 100 items per page
    offset: int = Query(0, ge=0)
) -> List[Dict]:
    # Calculate the start and end of the slice
    start = offset
    end = offset + limit
    
    # In a real application, you would pass limit and offset to your database query
    return fake_db[start:end]
