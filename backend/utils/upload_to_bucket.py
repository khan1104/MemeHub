from supabase import create_client
from fastapi import UploadFile, HTTPException, status
import uuid
from pathlib import Path
import magic
import shutil
from constants.bucket import Bucket
from core.config import settings
from fastapi.concurrency import run_in_threadpool

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024

ALLOWED_IMAGE_EXT = {"jpg", "jpeg", "png"}
ALLOWED_VIDEO_EXT = {"mp4", "mov", "webm"}

ALLOWED_MIMES = {
    "image": ["image/jpeg", "image/png"],
    "video": ["video/mp4", "video/webm", "video/quicktime"]
}

MEMORY_THRESHOLD = 5 * 1024 * 1024  # 5MB
TEMP_UPLOAD_DIR = Path("temp_storage")
TEMP_UPLOAD_DIR.mkdir(exist_ok=True)

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def validate_magic_bytes(file_head: bytes, media_type: str):
    mime = magic.from_buffer(file_head, mime=True)
    if mime not in ALLOWED_MIMES[media_type]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {media_type} file. Detected MIME: {mime}"
        )
    return mime


async def upload_to_bucket(bucket: Bucket, file: UploadFile, file_ext: str) -> str:
    temp_file_path = None

    try:
        # File size check
        file.file.seek(0,2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_ext in ALLOWED_IMAGE_EXT:
            media_type = "image"
            if file_size > MAX_IMAGE_SIZE:
                raise HTTPException(413, "Image too large (max 5MB)")
        elif file_ext in ALLOWED_VIDEO_EXT:
            media_type = "video"
            if file_size > MAX_VIDEO_SIZE:
                raise HTTPException(413, "Video too large (max 50MB)")
        else:
            raise HTTPException(400, "Unsupported file extension")

        # Magic byte validation
        head = await file.read(2048)
        detected_mime=validate_magic_bytes(head,media_type)
        file.file.seek(0)

        # Path generation
        if bucket == Bucket.PROFILE:
            file_name = f"users_profile_pics/{uuid.uuid4()}.{file_ext}"
        elif bucket == Bucket.POSTS:
            folder = "images" if media_type == "image" else "videos"
            file_name = f"{folder}/{uuid.uuid4()}.{file_ext}"
        else:
            raise HTTPException(400, "Invalid bucket")

        if file_size <= MEMORY_THRESHOLD:
            content = await file.read()
            supabase.storage.from_(bucket).upload(
                file_name,
                content,
                file_options={"content-type": detected_mime}
            )
        else:
            safe_name = f"large_{uuid.uuid4()}.{file_ext}"
            temp_file_path = TEMP_UPLOAD_DIR / safe_name

            def save_to_disk():
                with open(temp_file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer,length=1024*1024) # 1MB chunks

            await run_in_threadpool(save_to_disk)

            supabase.storage.from_(bucket).upload(
                file_name,
                str(temp_file_path),
                file_options={"content-type":detected_mime}
            )

        return supabase.storage.from_(bucket).get_public_url(file_name)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Upload error: {str(e)}")
    finally:
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
