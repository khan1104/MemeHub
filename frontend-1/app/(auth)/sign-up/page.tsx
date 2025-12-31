"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
// import { registerSchema } from "@/schemas/Auth";
// import { registerSchema } from "@/schemas/auth";
import axios from 'axios';



export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError]=useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //   const result=registerSchema.safeParse({
    //   username:username,
    //   email:email,
    //   password:password
    // })
    // if(!result.success)
    // {
    //   const firstIssue = result.error.issues[0];
    //   const errorMessage = `${firstIssue.path.join('.')}: ${firstIssue.message}`;
    //   setError(errorMessage);
    //   return;
    // } 
    // // API call yaha lagega
    // try{
    //   const response=await axios.post("http://127.0.0.1:8000/api/auth/register",
    //     {
    //      user_name:username,
    //      email:email,
    //      password:password
    //     },
    //     {
    //       withCredentials:true
    //     }
    //   )
    //   if(response.status==201){
    //     router.push("/sign-in");
    //   }
    // }
    // catch(error){
    //     console.log(error);
    // }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-[clamp(2rem,6vw,2.5rem)] tracking-wide text-primary font-bold text-center">
          MemeHub
        </h1>
      </header>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-[14px] shadow-card p-6 sm:p-8">
        <h2 className="text-center text-[clamp(1.4rem,4vw,2rem)] mb-6 font-semibold text-title">
          Get Started!
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5 text-label">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
            className="
              w-full rounded-[10px]
              py-3 bg-primary
              text-white font-bold
              transition-all
              hover:bg-[#5d35c7]
              hover:-translate-y-[2px]
            "
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6 text-[0.85rem] text-label">
          <div className="flex-1 border-b border-border" />
          <span className="mx-2.5">Or continue with</span>
          <div className="flex-1 border-b border-border" />
        </div>

        <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                if (!credentialResponse.credential) return;

                const res = await axios.post(
                  "http://127.0.0.1:8000/api/auth/google",
                  {
                    id_token: credentialResponse.credential,
                  }
                );

                if (res.status === 200 || res.status === 201) {
                  console.log(res)
                }
              } catch (err) {
                console.error("Google login error", err);
                setError("Google authentication failed");
              }
            }}
            onError={() => {
              setError("Google Login Failed");
            }}
          />
      </div>

      {/* Footer */}
      <footer className="mt-5 text-center text-sm text-label">
        Already have an account?{" "}
        <a href="/sign-in" className="font-bold text-primary">
          Sign In
        </a>
      </footer>
    </div>
  );
}
