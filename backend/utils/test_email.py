import random
from fastapi import HTTPException, status
import database.config.redis as redis_config


def generate_otp():
    return str(random.randint(100000, 999999))


async def send_otp_email(email: str):
    otp = generate_otp()
    try:
        await redis_config.redis_client.setex(f"otp:{email}", 300, otp)
        return otp

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Redis server error"
        )


async def verifyOtp(email: str, otp: str):
    try:  
      data =await redis_config.redis_client.get(f"otp:{email}")
    except Exception as e:
       raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="something went wrong with redis server")
    
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OTP has expired")
    
    if str(data) != str(otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    
    await redis_config.redis_client.delete(f"otp:{email}")
    return data
