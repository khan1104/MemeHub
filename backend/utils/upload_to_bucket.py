from supabase import create_client
import uuid
from fastapi import HTTPException,status
import magic
from core.config import settings

MAX_IMAGE_SIZE = 5 * 1024 * 1024      # 5 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024     # 50 MB

ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png"}
ALLOWED_VIDEO_EXT = {"mp4", "mov", "webm"}

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def validate_magic_bytes(file_bytes, expected_type):
    mime = magic.from_buffer(file_bytes[:2048], mime=True)
    print(mime)

    if expected_type == "image" and not mime.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Invalid image file. MIME detected: {mime}")

    if expected_type == "video" and not mime.startswith("video/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Invalid video file. MIME detected: {mime}")


async def upload_to_bucket(bucket: str, file, file_ext: str) -> str:
    try:
        file_bytes =await file.read()
        file_size = len(file_bytes)
        file_ext = file_ext.lower()

        if file_ext in ALLOWED_IMAGE_EXT:
            media_type = "image"
            if file_size > MAX_IMAGE_SIZE:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Image too large (max {MAX_IMAGE_SIZE / 1024 / 1024} MB)")
        
        elif file_ext in ALLOWED_VIDEO_EXT:
            media_type = "video"
            if file_size > MAX_VIDEO_SIZE:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Video too large (max {MAX_VIDEO_SIZE / 1024 / 1024} MB)")

        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Unsupported file extension '{file_ext}'")

        # Magic Byte Validation
        validate_magic_bytes(file_bytes, media_type)

        if bucket == "profile_pics":
            file_name = f"users_profile_pics/{uuid.uuid4()}.{file_ext}"

        elif bucket == "users_posts":
            folder = "images" if media_type == "image" else "videos"
            file_name = f"{folder}/{uuid.uuid4()}.{file_ext}"

        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=f"Invalid bucket name '{bucket}'")

        content_type = f"{media_type}/{file_ext}"

        response = supabase.storage.from_(bucket).upload(
            file_name,
            file_bytes,
            {"contentType": content_type}
        )
        if not response.path:
            raise HTTPException(500, "Upload failed")

        url = supabase.storage.from_(bucket).get_public_url(file_name)
        return url
        # fake_url="https://cdn.mastmeme.com/default_profile.png"
        # return fake_url

    except Exception as e:
        raise HTTPException(500, str(e))
