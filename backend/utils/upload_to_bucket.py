from supabase import create_client
from fastapi import UploadFile, HTTPException, status
import uuid
import magic
from core.config import settings

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024

ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png"}
ALLOWED_VIDEO_EXT = {"mp4", "mov", "webm"}

ALLOWED_MIMES = {
    "image": ["image/jpeg", "image/png"],
    "video": ["video/mp4", "video/webm", "video/quicktime"]
}

CONTENT_TYPE_MAP = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "mp4": "video/mp4",
    "mov": "video/quicktime",
    "webm": "video/webm",
}

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def validate_magic_bytes(file_bytes: bytes, media_type: str):
    mime = magic.from_buffer(file_bytes[:2048], mime=True)
    if mime not in ALLOWED_MIMES[media_type]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {media_type} file. Detected MIME: {mime}"
        )


async def upload_to_bucket(bucket: str, file: UploadFile, file_ext: str) -> str:
    try:
        # check file size before the bytes reading 
        file_size = (file.file.seek(0, 2), file.file.tell(), file.file.seek(0))[1]

        if file_ext in ALLOWED_IMAGE_EXT:
            media_type = "image"
            if file_size > MAX_IMAGE_SIZE:
                raise HTTPException(400, "Image too large (max 5MB)")

        elif file_ext in ALLOWED_VIDEO_EXT:
            media_type = "video"
            if file_size > MAX_VIDEO_SIZE:
                raise HTTPException(400, "Video too large (max 50MB)")

        else:
            raise HTTPException(400, f"Unsupported file extension '{file_ext}'")

        # magic byte validation
        file_bytes = await file.read()
        validate_magic_bytes(file_bytes, media_type)

        if bucket == "profile_pics":
            file_name = f"users_profile_pics/{uuid.uuid4()}.{file_ext}"
        elif bucket == "users_posts":
            folder = "images" if media_type == "image" else "videos"
            file_name = f"{folder}/{uuid.uuid4()}.{file_ext}"
        else:
            raise HTTPException(400, "Invalid bucket name")

        content_type = CONTENT_TYPE_MAP[file_ext]

        response = supabase.storage.from_(bucket).upload(
            file_name,
            file_bytes,
            {"contentType": content_type}
        )

        if not response.path:
            raise HTTPException(500, "Upload failed")

        return supabase.storage.from_(bucket).get_public_url(file_name)
        # fake_url="https://cdn.mastmeme.com/default_profile.png"
        # return fake_url

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Upload error: {str(e)}")
