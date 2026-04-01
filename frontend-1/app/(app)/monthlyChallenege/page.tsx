"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

function MonthlyChallenge() {
  const router = useRouter();
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
        Monthly Meme Challenge
      </h2>
      <p className="mt-3 text-gray-600 text-sm md:text-base">
        🚧 We’re working on something exciting!
      </p>

      <p className="text-gray-500 text-sm mt-1">
        This feature is coming soon. Stay tuned 🚀
      </p>
      <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition cursor-pointer"
      onClick={()=>router.push("/home")}>
        Explore Memes
      </button>
    </div>
  );
}

export default MonthlyChallenge;
