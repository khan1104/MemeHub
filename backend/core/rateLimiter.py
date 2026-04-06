from slowapi import Limiter
from dependency.rate_limit_key import get_rate_limit_key
from core.config import settings

limiter = Limiter(
    key_func=get_rate_limit_key,
    storage_uri=settings.REDIS_HOST_URL
)