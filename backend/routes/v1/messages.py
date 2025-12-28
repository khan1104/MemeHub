from fastapi import APIRouter, status, Depends, Query
from dependency.auth_dependency import get_current_user


route=APIRouter()


@route.post("/send/{reciver_id}")
def send_message(text:str,current_user=Depends(get_current_user)):
    pass

@route.get("/{user_id}")
def get_messages():
    pass
