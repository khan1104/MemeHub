"use client";

import { useState } from "react";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import {
  loginUser,
  gooleLoginUser,
  registerUser,
  sendOtpToEmail,
  verifyOtpCode,
  logoutUser,
} from "@/services/auth.service.";
import { setAccessToken } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { clearAccessToken } from "@/lib/api";

export const useAuth = () => {
  const {loadUser,isLoggedIn}=useUser()
  const [showLoginModal, setShowLoginModal] = useState(false);
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
      const data = await loginUser({ email, password });
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
      const data = await gooleLoginUser(tokenId);
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
      await registerUser({ user_name, email, password });
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
      await sendOtpToEmail(email);
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
      await verifyOtpCode(email, otp);
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
      await logoutUser();
      clearAccessToken();
      return true;
    } finally {
      setLoading(false);
    }
  };
  const checkAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  return {
    login,
    googleLogin,
    register,
    sendOtp,
    verifyOtp,
    logout,
    checkAuth,
    showLoginModal,
    setShowLoginModal,
    loading,
    error,
    setError,
  };
};
