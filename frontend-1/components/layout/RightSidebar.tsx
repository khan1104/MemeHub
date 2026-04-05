"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MonthlyTopUsers } from "@/types/user.type";
import { useUsers } from "@/hooks/user";
import { formatCount } from "@/lib/formatCount";

function RightSidebar() {
  const router = useRouter();
  const { getMonthlyTopUsers, loading, error } = useUsers();
  const [topUsers, setTopUsers] = useState<MonthlyTopUsers[]>([]);
  const [showRules, setShowRules] = useState(false);

  const today = new Date().getDate();
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
  });

  const handleGetTopUsers = async () => {
    const res = await getMonthlyTopUsers();
    if (res) {
      setTopUsers(res);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (today <= 10) return;
    handleGetTopUsers();
  }, []);

  return (
    <>
      <aside className="w-full lg:w-[320px] space-y-6">
        {/* 🔥 Monthly Challenge Card */}
        <div className="rounded-2xl bg-purple-700 text-white p-5 shadow-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🏆 Monthly Meme Challenge
          </h2>

          <p className="mt-3 text-sm">
            Theme: <span className="font-semibold">Future Tech Gone Wrong</span>
          </p>

          <div className="mt-2 flex justify-between text-sm">
            <span>
              Reward: <span className="font-semibold">Accounce Later</span>
            </span>
            <span className="text-yellow-300 font-bold">Ends in: 5 Days</span>
          </div>

          <button
            className="mt-4 w-full rounded-full bg-yellow-400 text-purple-900 font-bold py-2 hover:bg-yellow-300 transition"
            onClick={() => router.push("/monthlyChallenege")}
          >
            View Details & Participate
          </button>
        </div>

        {/* 🏆 Leaderboard */}
        <div className="rounded-2xl bg-white p-5 shadow border-t-4 border-purple-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Top Creators (This Month)
          </h3>

          {error && (
            <p className="text-red-500 text-sm">Failed to load top creators</p>
          )}

          {/* ⏳ Loading */}
          {loading && today > 10 && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-300" />
                  <div className="flex-1 h-4 bg-gray-300 rounded" />
                  <div className="w-10 h-4 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* 🚀 Before 10th */}
          {today <= 10 ? (
            <div className="text-center py-6">
              <p className="text-gray-600 text-sm">
                🚀 Leaderboard will start after{" "}
                <span className="font-semibold text-purple-600">
                  10 {currentMonth}
                </span>
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Stay active and start posting memes to climb the leaderboard!
              </p>

              {/* 🔥 View Rules */}
              <button
                onClick={() => setShowRules(true)}
                className="mt-3 text-purple-600 text-sm font-semibold hover:underline"
              >
                View Rules
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                  onClick={() => router.push(`/profile/${user.user_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500">
                      #{index + 1}
                    </span>

                    <div className="relative h-10 w-10">
                      <Image
                        src={user.profile_pic}
                        alt="profile"
                        fill
                        className="rounded-full object-cover border"
                      />
                    </div>

                    <span className="font-medium text-gray-800">
                      @{user.user_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-purple-600 font-semibold">
                    👍 {formatCount(user.total_likes)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 🔥 RULES MODAL */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-purple-700">
              📜 Leaderboard Rules
            </h2>

            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Leaderboard starts after 10th of every month</li>
              <li>• And ends on 31st of every month</li>
              <li>• Users with maximum likes on thier post rank higher</li>
              <li>• Top creators will be displayed in leaderboard</li>
            </ul>

            <button
              onClick={() => setShowRules(false)}
              className="mt-5 w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RightSidebar;
