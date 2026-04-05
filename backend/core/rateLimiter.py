from slowapi import Limiter
from dependency.rate_limit_key import get_rate_limit_key

limiter = Limiter(
    key_func=get_rate_limit_key,
    storage_uri="redis://localhost:6379"
)