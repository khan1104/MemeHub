"use client";

import { useState } from "react";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import {
  handleLogin,
  handleGoogleLogin,
  handleRegister,
  handleSendOtp,
  handleVerifyOtp,
  handleLogout,
} from "@/services/auth.service.";
import { setAccessToken } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { clearAccessToken } from "@/lib/api";

export const useAuthActions = () => {
  const {loadUser}=useUser()

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      const data = await handleLogin({ email, password });
      setAccessToken(data.access_token);
      await loadUser();
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (tokenId: string) => {
    try {
      setLoading(true);
      const data = await handleGoogleLogin(tokenId);
      setAccessToken(data.access_token);
      await loadUser();
      return true;
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (user_name: string, email: string, password: string) => {
    const validation = registerSchema.safeParse({ user_name, email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      await handleRegister({ user_name, email, password });
      localStorage.setItem("verify_email", email);
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const email = localStorage.getItem("verify_email");
    if (!email) return false;

    try {
      setLoading(true);
      await handleSendOtp(email);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    const email = localStorage.getItem("verify_email");
    if (!email || otp.length !== 6) return;

    try {
      setLoading(true);
      await handleVerifyOtp(email, otp);
      localStorage.removeItem("verify_email");
      return true
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await handleLogout();
      clearAccessToken();
      return true;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    googleLogin,
    register,
    sendOtp,
    verifyOtp,
    logout,
    loading,
    error,
    setError,
  };
};
