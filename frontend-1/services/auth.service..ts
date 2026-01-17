
import { public_api,protected_api } from "@/lib/api";
import { LoginInput,RegisterInput } from "@/schemas/auth.schema";
import {apiError} from "@/lib/apiError";


export const handleLogin = async (loginData: LoginInput) => {
  try {
    const res = await public_api.post("/auth/login", loginData);
    return res.data;
  } catch (error: any) {
    apiError(error)
  }
};

export const handleGoogleLogin = async (token_id: string) => {
  try {
    const res = await public_api.post("/auth/google", {
      token_id,
    });
    return res.data;
  } catch (error: any) {
    apiError(error)
  }
};

export const handleRegister=async(registerData:RegisterInput)=>{
  try {
    const res = await public_api.post("/auth/register",registerData);
    return res.data;
  } catch (error: any) {
    apiError(error) 
  }
}

export const handleLogout=async()=>{
  try {
    const res = await protected_api.delete("/auth/logout");
    return res.data;
  } catch (error: any) {
    apiError(error) 
  }
}

export const handleVerifyOtp = async (email: string, otp: string) => {
  try {
    const res = await public_api.post("/auth/verify-otp", { email, otp });
    return res.data;
  } catch (error: any) {
    apiError(error)
  }
};

export const handleSendOtp = async (email: string) => {
  try {
    const res = await public_api.post("/auth/send-otp", { email });
    return res.data;
  } catch (error: any) {
    apiError(error)
  }
};
