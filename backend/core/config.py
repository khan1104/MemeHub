from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MONGO_URI: str
    DATABASE_NAME: str

    REDIS_HOST_URL: str = "redis"

    JWT_SECRET_KEY: str
    JWT_REFRESH_KEY: str
    ALGORITHM: str = "HS256"

    SUPABASE_URL: str
    SUPABASE_KEY: str
    POSTS_BUCKET: str 
    PROFILE_PICS_BUCKET: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_SECRET_KEY: str

    BREVO_API_KEY: str

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
