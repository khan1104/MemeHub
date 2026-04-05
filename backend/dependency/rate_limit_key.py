from fastapi import Request
from slowapi.util import get_remote_address
from utils.authentication import verify_token

def get_rate_limit_key(request: Request):
    auth_header = request.headers.get("Authorization")

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

        try:
            user_id = verify_token(token)  # 👈 reuse your function
            return f"user:{user_id}"
        except Exception:
            pass  # fallback to IP if token invalid/expired

    return f"ip:{get_remote_address(request)}"