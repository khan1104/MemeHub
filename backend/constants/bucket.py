from enum import Enum

class Bucket(str, Enum):
    PROFILE = "profile_pics"
    POSTS = "users_posts"


