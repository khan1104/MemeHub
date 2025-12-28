from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from pymongo import ASCENDING

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

async def create_indexes():


    await db["refresh_tokens"].create_index(
        [("expires_at", ASCENDING)],
        expireAfterSeconds=0
    )

    await db["reported_users"].create_index(
        [("reported_user", ASCENDING), ("reported_by", ASCENDING)],
        unique=True
    )

    await db["reported_posts"].create_index(
        [("reported_post", ASCENDING), ("reported_by", ASCENDING)],
        unique=True
    )

    await db["reported_comments"].create_index(
        [("reported_comment", ASCENDING), ("reported_by", ASCENDING)],
        unique=True
    )

    await db["friend_requests"].create_index(
        [("requester_id", ASCENDING), ("recipient_id", ASCENDING)],
        unique=True
    )

    await db["friends"].create_index(
        [("user_one", ASCENDING), ("user_two", ASCENDING)],
        unique=True
    )

