from database.mongoDB.actions.base import BaseActions
from database.mongoDB.collections.collection import friends,friend_requests

class FriendsAction(BaseActions):
    def __init__(self):
        super().__init__(friends)


class FriendRequestAction(BaseActions):
    def __init__(self):
        super().__init__(friend_requests)

