from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.friends import FriendRequestAction, FriendsAction
from database.mongoDB.actions.user import UserActions
from bson import ObjectId
from constants.requestStatus import FriendRequestStatus


class FriendService:
    def __init__(self):
        self.friends_actions = FriendsAction()
        self.friend_request_actions = FriendRequestAction()
        self.user_actions = UserActions()

    async def send_friend_request(self, user_id: str, current_user_id: str):
        self.friend_request_actions.validate_object_id(user_id)

        if user_id == str(current_user_id):
            raise HTTPException(400, "You cannot send a friend request to yourself")

        user = await self.user_actions.get_data_by_id(user_id, {"_id": 1})
        if not user:
            raise HTTPException(404, "User does not exist")

        # Already friends check
        already_friends = await self.friends_actions.get_by_filter({
            "$or": [
                {"user_one": current_user_id, "user_two": ObjectId(user_id)},
                {"user_one": ObjectId(user_id), "user_two": current_user_id},
            ]
        }, {"_id": 1})

        if already_friends:
            raise HTTPException(400, "You both are already friends")

        # Reverse request (B → A)
        reverse_request = await self.friend_request_actions.get_by_filter({
            "requester_id": ObjectId(user_id),
            "recipient_id": current_user_id
        })

        if reverse_request:
            if reverse_request["status"] == FriendRequestStatus.PENDING:
                raise HTTPException(400, "User has already sent you a request")

            if reverse_request["status"] == FriendRequestStatus.ACCEPTED:
                raise HTTPException(400, "You both are already friends")

        # Existing request (A → B)
        existing_request = await self.friend_request_actions.get_by_filter({
            "requester_id": current_user_id,
            "recipient_id": ObjectId(user_id)
        })

        if existing_request:
            if existing_request["status"] == FriendRequestStatus.PENDING:
                raise HTTPException(400, "Friend request already sent")

            if existing_request["status"] == FriendRequestStatus.REJECTED:
                # Optional cooldown check here
                await self.friend_request_actions.updated(
                    existing_request["_id"],
                    {
                        "status": FriendRequestStatus.PENDING
                    }
                )
                return

        # 4️⃣ Create new request
        try:
            await self.friend_request_actions.create({
                "requester_id": current_user_id,
                "recipient_id": ObjectId(user_id),
                "status": FriendRequestStatus.PENDING,
            })
        except DuplicateKeyError:
            raise HTTPException(400, "Friend request already exists")

    async def handle_friend_request(self, request_id: str, current_user_id: str, action: str):
        self.friend_request_actions.validate_object_id(request_id)
        request =await self.friend_request_actions.get_data_by_id(request_id,{"recipient_id":1,"requester_id":1,"status":1})
        if not request:
            raise HTTPException(404, "Request not found")

        self.friend_request_actions.ensure_owner(request["recipient_id"],current_user_id,"You cannot act on someone else's request")

        if request["status"] != FriendRequestStatus.PENDING:
            raise HTTPException(400, "This request is already processed")

        if action == FriendRequestStatus.REJECTED:
            await self.friend_request_actions.updated(request["_id"],{"status":FriendRequestStatus.REJECTED})
            return

        if action == FriendRequestStatus.ACCEPTED:
            await self.friend_request_actions.updated(request["_id"],{"status":FriendRequestStatus.ACCEPTED})
            await self.friends_actions.create({
                "user_one": ObjectId(request["requester_id"]),
                "user_two": ObjectId(request["recipient_id"])
            })
            return
        raise HTTPException(400, "Invalid action")

    async def get_requests(self, **kwargs):
        request=await self.friend_request_actions.get_requests(**kwargs)
        return request


    async def cancel_request(self, user_id: str, current_user_id: str):
        self.friend_request_actions.validate_object_id(user_id)
        request =await self.friend_request_actions.get_by_filter({
            "requester_id": current_user_id,
            "recipient_id": ObjectId(user_id),
            "status":FriendRequestStatus.PENDING
        },{"_id": 1})

        if not request:
            raise HTTPException(404, "No pending friend request")

        await self.friend_request_actions.hard_delete(request["_id"])

    async def remove_friend(self, user_id: str, current_user_id: str):
        self.friends_actions.validate_object_id(user_id)
        friend =await self.friends_actions.get_by_filter({
            "$or": [
                {"user_one": current_user_id, "user_two": ObjectId(user_id)},
                {"user_one": ObjectId(user_id), "user_two": current_user_id},
            ]
        },{"_id": 1})
        if not friend:
            raise HTTPException(404, "You both are not friends")
        
        await self.friend_request_actions.hard_delete(filter={
            "$or": [
                {"requester_id": current_user_id,"recipient_id": ObjectId(user_id)},
                {"requester_id": ObjectId(user_id),"recipient_id": current_user_id},
            ]
        })
        await self.friends_actions.hard_delete(friend["_id"])

    async def get_friends(self,**kwargs):
        friends=await self.friends_actions.get_user_friends(**kwargs)
        return friends
    
    async def get_mutual_friends(self,**kwargs):
        friends=await self.friends_actions.get_mutual_friends(**kwargs)
        return friends
    
