
import { public_api } from "@/lib/api";
import { LoginInput,RegisterInput } from "@/schemas/Auth";
import { string } from "zod";

export const handleLogin = async (loginData: LoginInput) => {
  try {
    const res = await public_api.post("/auth/login", loginData);
    return res.data;
  } catch (error: any) {
    console.log(error)
    if (!error.response) {
      throw new Error("Server error. try again.");
    }
    else{
      const message = error.response?.data?.detail || "Something went wrong";
      throw new Error(message);
    }
  }
};

export const handleRegister=async(registerData:RegisterInput)=>{
  try {
    const res = await public_api.post("/auth/register",registerData);
    return res.data;
  } catch (error: any) {

    if (!error.response) {
      throw new Error("Server error. try again.");
    }
    else{
      const message = error.response?.data?.detail || "Something went wrong";
      throw new Error(message);
    }
  }
}

export const handleLogout=async()=>{
  
}

export const handleVerifyOtp = async (email: string, otp: string) => {
  try {
    const res = await public_api.post("/auth/verify-otp", { email, otp });
    return res.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error("Server error. Try again.");
    }
    throw new Error(error.response?.data?.detail || "Invalid OTP");
  }
};

export const handleSendOtp = async (email: string) => {
  try {
    const res = await public_api.post("/auth/resend-otp", { email });
    return res.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error("Server error. Try again.");
    }
    throw new Error(error.response?.data?.detail || "Failed to resend OTP");
  }
};
