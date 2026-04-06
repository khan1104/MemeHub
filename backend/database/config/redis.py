import redis.asyncio as redis
from core.config import settings
import logging
logger = logging.getLogger(__name__)

redis_client = None

async def initialize_redis():
    global redis_client
    try:
        redis_client = redis.from_url(
        settings.REDIS_HOST_URL,
        decode_responses=True)
        logger.info("redis connected")
    except Exception as e:
        logger.error("error while connecting to database")
