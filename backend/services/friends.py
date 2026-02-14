from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError
from database.mongoDB.actions.friends import FriendRequestAction, FriendsAction
from database.mongoDB.actions.user import UserActions
from bson import ObjectId
from constants.requestStatus import FriendRequestStatus


class FriendService:
    def __init__(self):
        self.FriendsActions = FriendsAction()
        self.FriendRequestAction = FriendRequestAction()
        self.UserAction = UserActions()

    async def send_friend_request(self, user_id: str, current_user_id: str):
        self.FriendRequestAction.validate_object_id(user_id)

        if user_id == str(current_user_id):
            raise HTTPException(400, "You cannot send a friend request to yourself")

        user = await self.UserAction.get_data_by_id(user_id, {"_id": 1})
        if not user:
            raise HTTPException(404, "User does not exist")

        # 1️⃣ Already friends check
        already_friends = await self.FriendsActions.get_by_filter({
            "$or": [
                {"user_one": current_user_id, "user_two": ObjectId(user_id)},
                {"user_one": ObjectId(user_id), "user_two": current_user_id},
            ]
        }, {"_id": 1})

        if already_friends:
            raise HTTPException(400, "You both are already friends")

        # 2️⃣ Reverse request (B → A)
        reverse_request = await self.FriendRequestAction.get_by_filter({
            "requester_id": ObjectId(user_id),
            "recipient_id": current_user_id
        })

        if reverse_request:
            if reverse_request["status"] == FriendRequestStatus.PENDING:
                raise HTTPException(400, "User has already sent you a request")

            if reverse_request["status"] == FriendRequestStatus.ACCEPTED:
                raise HTTPException(400, "You both are already friends")

        # 3️⃣ Existing request (A → B)
        existing_request = await self.FriendRequestAction.get_by_filter({
            "requester_id": current_user_id,
            "recipient_id": ObjectId(user_id)
        })

        if existing_request:
            if existing_request["status"] == FriendRequestStatus.PENDING:
                raise HTTPException(400, "Friend request already sent")

            if existing_request["status"] == FriendRequestStatus.REJECTED:
                # Optional cooldown check here
                await self.FriendRequestAction.updated(
                    existing_request["_id"],
                    {
                        "status": FriendRequestStatus.PENDING
                    }
                )
                return

        # 4️⃣ Create new request
        try:
            await self.FriendRequestAction.create({
                "requester_id": current_user_id,
                "recipient_id": ObjectId(user_id),
                "status": FriendRequestStatus.PENDING,
            })
        except DuplicateKeyError:
            raise HTTPException(400, "Friend request already exists")

    async def handle_friend_request(self, request_id: str, current_user_id: str, action: str):
        self.FriendRequestAction.validate_object_id(request_id)
        request =await self.FriendRequestAction.get_data_by_id(request_id,{"recipient_id":1,"requester_id":1,"status":1})
        if not request:
            raise HTTPException(404, "Request not found")

        self.FriendRequestAction.ensure_owner(request["recipient_id"],current_user_id,"You cannot act on someone else's request")

        if request["status"] != FriendRequestStatus.PENDING:
            raise HTTPException(400, "This request is already processed")

        if action == FriendRequestStatus.REJECTED:
            await self.FriendRequestAction.updated(request["_id"],{"status":FriendRequestStatus.REJECTED})
            return

        if action == FriendRequestStatus.ACCEPTED:
            await self.FriendRequestAction.updated(request["_id"],{"status":FriendRequestStatus.ACCEPTED})
            await self.FriendsActions.create({
                "user_one": ObjectId(request["requester_id"]),
                "user_two": ObjectId(request["recipient_id"])
            })
            return
        raise HTTPException(400, "Invalid action")

    async def get_requests(self, current_user_id: str):
        request=await self.FriendRequestAction.get_all({
            "recipient_id": current_user_id,
            "status": FriendRequestStatus.PENDING
        })
        return request

    async def cancel_request(self, user_id: str, current_user_id: str):
        self.FriendRequestAction.validate_object_id(user_id)
        request =await self.FriendRequestAction.get_by_filter({
            "requester_id": current_user_id,
            "recipient_id": ObjectId(user_id),
            "status":FriendRequestStatus.PENDING
        },{"_id": 1})

        if not request:
            raise HTTPException(404, "No pending friend request")

        await self.FriendRequestAction.hard_delete(request["_id"])

    async def remove_friend(self, user_id: str, current_user_id: str):
        self.FriendsActions.validate_object_id(user_id)
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

    async def get_friends(self,**kwargs):
        friends=await self.FriendsActions.get_user_friends(**kwargs)
        return friends
    
    async def get_mutual_friends(self,**kwargs):
        friends=await self.FriendsActions.get_mutual_friends(**kwargs)
        return friends
    
