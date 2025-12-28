"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Logo */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-[clamp(2rem,6vw,2.5rem)] tracking-wide text-primary text-center font-bold">
          MemeHub
        </h1>
      </header>

      {/* Card */}
      <div
        className="
          w-full
          max-w-[420px]
          bg-white
          rounded-[14px]
          shadow-card
          p-6 sm:p-8
        "
      >
        <h2 className="text-center text-[clamp(1.4rem,4vw,2rem)] mb-6 font-semibold text-title">
          Welcome Back!
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-semibold mb-1.5 text-label">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-[10px]
                border border-border
                px-3.5 py-3
                text-base
                focus:outline-none
                focus:border-primary
                focus:ring-3 focus:ring-[rgba(114,64,232,0.2)]
              "
            />
          </div>

          {/* Password */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-semibold mb-1.5 text-label">
                Password
            </label>

            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                    w-full rounded-[10px]
                    border border-border
                    px-3.5 pr-11 py-3
                    text-base
                    focus:outline-none
                    focus:border-primary
                    focus:ring-3 focus:ring-[rgba(114,64,232,0.2)]
                "
                />

                {/* Eye Toggle */}
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    text-label
                    hover:text-primary
                    transition-colors
                "
                >
                {showPassword ? (
                    <EyeOff size={20} />
                ) : (
                    <Eye size={20} />
                )}
                </button>
            </div>
            </div>

          {/* Options */}
          <div
            className="
              flex justify-between items-center
              mb-6 text-sm
              max-[480px]:flex-col
              max-[480px]:items-start
              max-[480px]:gap-2
            "
          >
            <label className="flex gap-1.5 items-center">
              <input type="checkbox" />
              <span className="text-label">Remember Me</span>
            </label>

            <a className="cursor-pointer text-label">
              Forgot Password?
            </a>
          </div>

          {/* Button */}
          <button
            className="
              w-full rounded-[10px]
              py-3
              bg-primary
              text-white text-[1rem] sm:text-[1.05rem]
              font-bold
              transition-all
              hover:bg-[#5d35c7]
              hover:-translate-y-[2px]
              disabled:opacity-60
            "
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6 sm:my-7 text-[0.85rem] text-label">
          <div className="flex-1 border-b border-border" />
          <span className="mx-2.5 whitespace-nowrap">
            Or continue with
          </span>
          <div className="flex-1 border-b border-border" />
        </div>

        <GoogleLogin
            onSuccess={()=>console.log("true")}
            onError={() => console.log("Google Login Failed")}
          />
      </div>

      {/* Footer */}
      <footer className="mt-5 text-center text-sm sm:text-[0.95rem] text-label">
        New to MemeHub?{" "}
        <a href="/sign-up" className="font-bold text-primary">
          Create an Account
        </a>
      </footer>
    </div>
  );
}
