"use client";

import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AlertCircle } from "lucide-react";
import { useAuthActions } from "@/hooks/auth";
import { useRouter } from "next/navigation";

const RESEND_TIME = 45;

export default function VerificationPage() {
  const router=useRouter();
  const { sendOtp, verifyOtp, loading, error } =useAuthActions();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(RESEND_TIME);

  // Safely get email on client side
  useEffect(() => {
    sendOtp()
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (timer > 0) return;
    const success = await sendOtp();
    if (success) setTimer(RESEND_TIME);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const success=await verifyOtp(otp);
    if(success) router.push("/sign-in")
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Card */}
      <div
        className="
          w-full max-w-[420px]
          bg-white rounded-[14px]
          shadow-card
          p-6 sm:p-8
          -mt-10 sm:-mt-20
        "
      >
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 animate-fadeIn">
            <AlertCircle size={18} className="mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <h2 className="text-center text-[clamp(1.4rem,4vw,2rem)] mb-2 font-semibold text-title">
          Verify your email
        </h2>

        <p className="text-center text-sm text-label mb-6">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleVerify}>
          {/* OTP */}
          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={otp} onChange={setOtp} inputMode="numeric" pattern="^[0-9]*$">
              <InputOTPGroup className="gap-1.5 sm:gap-2">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="
                      h-10 w-10 sm:h-12 sm:w-12
                      rounded-[10px]
                      border border-border
                      text-base sm:text-lg font-semibold
                      focus:border-primary
                      focus:ring-3 focus:ring-[rgba(114,64,232,0.2)]
                    "
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify Button */}
          <button
            disabled={otp.length !== 6 || loading}
            className="
              w-full rounded-[10px]
              py-3 bg-primary
              text-white font-bold
              transition-all
              hover:bg-[#5d35c7]
              hover:-translate-y-[2px]
              disabled:opacity-60
              disabled:pointer-events-none
            "
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-4 text-center text-sm text-label">
          {timer > 0 ? (
            <span>
              Resend OTP in{" "}
              <span className="font-semibold text-title">
                {timer}s
              </span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="font-bold text-primary hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
