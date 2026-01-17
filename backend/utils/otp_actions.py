
import requests
import secrets
import httpx
from fastapi import HTTPException, status
import database.config.redis as redis_config
from core.config import settings


API_KEY = settings.BREVO_API_KEY

def generate_otp():
    return str(secrets.randbelow(900000) + 100000)

async def send_otp_email(email):
    url = "https://api.brevo.com/v3/smtp/email"
    otp = generate_otp()

    htmlContent = f"""
    <div style="font-family:Arial, sans-serif; background-color:#fff9f3; padding:30px; border-radius:12px; max-width:500px; margin:auto; box-shadow:0 0 12px rgba(0,0,0,0.1);">
      <div style="text-align:center;">
        <h2 style="color:#44e35c; margin:10px 0;">MemeHub OTP Verification</h2>
        <h3 style="color:#44e35c; margin:10px 0;">Dont worry for now i don't have any domain </h3>
      </div>

      <p style="font-size:16px; color:#333;">Hey there 👋</p>
      <p style="font-size:16px; color:#333;">Here's your OTP to continue your meme journey:</p>

      <div style="background-color:#ffe1d2; padding:15px; text-align:center; border-radius:8px; font-size:24px; font-weight:bold; color:#44e35c; letter-spacing:2px; margin:20px 0;">
        {otp}
      </div>

      <p style="font-size:14px; color:#666; text-align:center;">
        This OTP will expire in 5 minutes. jaldi kar
      </p>

      <hr style="margin:30px 30px; border:none; border-top:1px solid #eee;">
      <p style="font-size:12px; color:#999; text-align:center;">
        Didn't request this? Someone's trying to sneak into MemeHub with your email. Ignore it safely.
      </p>
    </div>
    """

    data = {
        "sender": {
            "name": "MemeHub",
            "email": "khanirfan895765@gmail.com"
        },
        "to": [{"email": email}],
        "subject": "Your OTP Code",
        "htmlContent": htmlContent
    }

    headers = {
        "accept": "application/json",
        "api-key": API_KEY,
        "content-type": "application/json"
    }

    async with httpx.AsyncClient() as client:
      response = await client.post(url, json=data, headers=headers)

    if response.status_code in (200, 201): 
        try:
          await redis_config.redis_client.setex(f"otp:{email}", 300, otp)  # 5 minutes = 300 seconds
          return otp
        except Exception as e:
          raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="Something went wrong in redis server")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=response.text)


async def verifyOtp(email: str, otp: str):
    try:  
      data =await redis_config.redis_client.get(f"otp:{email}")
    except Exception as e:
       raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="something went wrong with redis server")
    
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OTP has expired")
    
    if str(data)!= otp:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    
    await redis_config.redis_client.delete(f"otp:{email}")
    return True
