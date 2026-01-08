import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginSchema ,registerSchema} from "@/schemas/Auth"
import { handleLogin,handleRegister,handleSendOtp,handleVerifyOtp } from "@/services/Auth"

export const useLogin = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      setError(errorMessage);
      return;
    }

    try {
      setLoading(true);
      await handleLogin({ email, password });
      router.replace("/home")


    } catch (err: any) {
      setError(err.message || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};


export const useRegister = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (user_name:string,email: string, password: string) => {
    setError(null);

    const validation = registerSchema.safeParse({user_name, email, password });
    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      setError(errorMessage);
      return;
    }

    try {
      setLoading(true);
      await handleRegister({user_name, email, password });
      localStorage.setItem("verify_email", email);
      router.push("/verification");

    } catch (err: any) {
      setError(err.message || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  return {register, loading, error };
};

export const useOtp = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (email: string) => {
    setError(null);
    try {
      setLoading(true);
      await handleSendOtp(email);

    } catch (err: any) {
      setError(err.message || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string,otp:string) => {
    setError(null);
    try {
      if (otp.length !== 6) return;
      setLoading(true);
      await handleVerifyOtp(email,otp);
      router.push("/sign-in");

    } catch (err: any) {
      setError(err.message || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  return {sendOtp,verifyOtp, loading, error };
};