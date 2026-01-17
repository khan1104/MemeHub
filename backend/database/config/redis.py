import redis.asyncio as redis
from core.config import settings

redis_client = None

async def initialize_redis():
    global redis_client
    redis_client = redis.Redis(
        host=settings.REDIS_HOST_URL,
        port=6379,
        db=0,
        decode_responses=True
    )
