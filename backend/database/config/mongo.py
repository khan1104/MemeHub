from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from pymongo import ASCENDING, DESCENDING

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

async def create_indexes():

    await db["users"].create_index([("user_name",1)])
    await db["users"].create_index([("email",1)])

    # 📌 POSTS
    await db["posts"].create_index([("created_at", DESCENDING)])
    await db["posts"].create_index([("created_by", ASCENDING)])

    # 📌 POST REACTIONS
    await db["posts_reactions"].create_index(
        [("post_id", ASCENDING), ("type", ASCENDING)]
    )

    # saved posts
    await db["saved_posts"].create_index(
        [("post_id",ASCENDING),("saved_by",ASCENDING)]
    )

    # 📌 FOLLOWERS (prevent duplicate follows)
    await db["followers"].create_index(
        [("follower_id", ASCENDING), ("following_id", ASCENDING)],
        unique=True
    )


    # 📌 REFRESH TOKENS (TTL)
    await db["refresh_tokens"].create_index(
        [("expires_at", ASCENDING)],
        expireAfterSeconds=0
    )

    # 📌 REPORTED USERS
    await db["reported_users"].create_index(
        [("reported_user", ASCENDING), ("reported_by", ASCENDING)],
        unique=True
    )

    # 📌 REPORTED POSTS
    await db["reported_posts"].create_index(
        [("reported_post", ASCENDING), ("reported_by", ASCENDING)],
        unique=True
    )

    # 📌 REPORTED COMMENTS
    await db["reported_comments"].create_index(
        [("reported_comment", ASCENDING), ("reported_by", ASCENDING)],
        unique=True
    )

    # 📌 FRIEND REQUESTS
    await db["friend_requests"].create_index(
        [("requester_id", ASCENDING), ("recipient_id", ASCENDING)],
        unique=True
    )

    # 📌 FRIENDS (mutual relation)
    await db["friends"].create_index(
        [("user_one", ASCENDING), ("user_two", ASCENDING)],
        unique=True
    )
