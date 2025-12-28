from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.friends import FriendRequestAction, FriendsAction
from database.mongoDB.actions.user import UserActions
from bson import ObjectId


class FriendService:
    def __init__(self):
        self.FriendsActions = FriendsAction()
        self.FriendRequestAction = FriendRequestAction()
        self.UserAction = UserActions()

    async def send_friend_request(self, user_id: str, current_user_id: str):
        self.FriendRequestAction.validate_object_id(user_id)
        if user_id == str(current_user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot send a friend request to yourself"
            )
        user=await self.UserAction.get_data_by_id(user_id,{"_id": 1})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")
        
        already_friends =await self.FriendsActions.get_by_filter({
            "$or": [
                {"user_one": current_user_id, "user_two": ObjectId(user_id)},
                {"user_one": ObjectId(user_id), "user_two": current_user_id},
            ]
        },{"_id": 1})
        if already_friends:
            raise HTTPException(400, "You both are already friends")
        
        reverse =await self.FriendRequestAction.get_by_filter({
            "requester_id": ObjectId(user_id),
            "recipient_id": current_user_id
        },{"_id": 1})

        if reverse:
            raise HTTPException(400, "User has already sent you a request")
        
        try:
            await self.FriendRequestAction.create({
                "requester_id": current_user_id,
                "recipient_id": ObjectId(user_id),
                "status": "pending"
            })

        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already sent the reques"
                )

    async def handle_friend_request(self, request_id: str, current_user_id: str, action: str):
        self.FriendRequestAction.validate_object_id(request_id)
        request =await self.FriendRequestAction.get_data_by_id(request_id,{"recipient_id":1,"status":1})
        if not request:
            raise HTTPException(404, "Request not found")

        self.FriendRequestAction.ensure_owner(request["recipient_id"],current_user_id,"You cannot act on someone else's request")

        if request["status"] != "pending":
            raise HTTPException(400, "This request is already processed")

        if action == "reject":
            await self.FriendRequestAction.hard_delete(request["_id"])
            return

        if action == "accept":
            await self.FriendRequestAction.hard_delete(request["_id"])
            await self.FriendsActions.create({
                "user_one": ObjectId(request["requester_id"]),
                "user_two": ObjectId(request["recipient_id"])
            })
            return
        raise HTTPException(400, "Invalid action")

    async def get_requests(self, current_user_id: str):
        request=await self.FriendRequestAction.get_all({
            "recipient_id": current_user_id,
            "status": "pending"
        })
        return request

    async def cancel_request(self, user_id: str, current_user_id: str):
        request =await self.FriendRequestAction.get_by_filter({
            "requester_id": current_user_id,
            "recipient_id": ObjectId(user_id)
        },{"_id": 1})

        if not request:
            raise HTTPException(404, "No pending friend request")

        await self.FriendRequestAction.hard_delete(request["_id"])

    async def remove_friend(self, user_id: str, current_user_id: str):

        friend =await self.FriendsActions.get_by_filter({
            "$or": [
                {"user_one": current_user_id, "user_two": ObjectId(user_id)},
                {"user_one": ObjectId(user_id), "user_two": current_user_id},
            ]
        },{"_id": 1})
        if not friend:
            raise HTTPException(404, "You both are not friends")
        
        await self.FriendRequestAction.hard_delete(filter={
            "$or": [
                {"requester_id": current_user_id,"recipient_id": ObjectId(user_id)},
                {"requester_id": ObjectId(user_id),"recipient_id": current_user_id},
            ]
        })
        await self.FriendsActions.hard_delete(friend["_id"])

    async def get_friends(self, current_user_id: str):
        friends=await self.FriendsActions.get_all({
            "$or": [
                {"user_one": current_user_id},
                {"user_two": current_user_id},
            ]
        })
        return friends
    
