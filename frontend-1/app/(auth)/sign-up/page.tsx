"use client";

import { useState } from "react";
import { Eye, EyeOff,AlertCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthActions } from "@/hooks/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router=useRouter()
  const {register,googleLogin,loading,error,setError}=useAuthActions();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent multiple clicks
    const success=await register(username,email, password);
    if(success) router.replace("/verification")
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Logo */}
      <header className="mb-6 sm:mb-8 mt-2">
        <h1 className="text-[clamp(2rem,6vw,2.5rem)] tracking-wide text-primary text-center font-bold">
          MemeHub
        </h1>
      </header>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-[14px] shadow-card p-6 sm:p-8">
        <h2 className="text-center text-[clamp(1.4rem,4vw,2rem)] mb-6 font-semibold text-title">
          Get Started!
        </h2>
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 animate-fadeIn">
            <AlertCircle size={18} className="mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-semibold mb-1.5 text-label">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              required
              value={username}
              onChange={(e) =>{setUsername(e.target.value)
                setError(null)
              }}
              className="
                w-full rounded-[10px]
                border border-border
                px-3.5 py-3
                focus:outline-none
                focus:border-primary
                focus:ring-3 focus:ring-[rgba(114,64,232,0.2)]
              "
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5 text-label">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)}}
              className="
                w-full rounded-[10px]
                border border-border
                px-3.5 py-3
                focus:outline-none
                focus:border-primary
                focus:ring-3 focus:ring-[rgba(114,64,232,0.2)]
              "
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5 text-label">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                required
                value={password}
                onChange={(e) => {setPassword(e.target.value)
                  setError(null)
                }}
                className="
                  w-full rounded-[10px]
                  border border-border
                  px-3.5 pr-11 py-3
                  focus:outline-none
                  focus:border-primary
                  focus:ring-3 focus:ring-[rgba(114,64,232,0.2)]
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-label hover:text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {/* Button */}
          <button
            disabled={loading}
            className="w-full rounded-[10px] py-3 bg-primary text-white font-bold transition-all hover:bg-[#5d35c7] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6 text-[0.85rem] text-label">
          <div className="flex-1 border-b border-border" />
          <span className="mx-2.5">Or continue with</span>
          <div className="flex-1 border-b border-border" />
        </div>

        <GoogleLogin
          onSuccess={async(data)=>{
            const success=await googleLogin(data.credential)
            if (success) router.replace("/home")}}
          onError={() => setError("Google login failed. Try again.")}
        />
      </div>

      {/* Footer */}
      <footer className="mt-5 text-center text-sm sm:text-[0.95rem] text-label">
        Already have an account?{" "}
        <a href="/sign-in" className="font-bold text-primary">
          Sign In
        </a>
      </footer>
    </div>
  );
}
