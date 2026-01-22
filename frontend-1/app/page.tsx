"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();


  useEffect(() => {
      const timer = setTimeout(() => {
        router.replace("/home");
      }, 1200);
      return () => clearTimeout(timer);
  }, [router]);

  return (
    
    <div className="flex h-screen flex-col items-center justify-center">
      {/* Logo */}
      <h1 className="text-5xl font-bold text-primary tracking-tight animate-pulse">
        MemeHub
      </h1>

      {/* Spinner */}
      <div className="mt-6 h-14 w-14 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin" />

      {/* Text */}
      <p className="mt-4 text-sm text-gray-500">
        Loading fresh memes for you 😄
      </p>
    </div>
  );
}
