import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MonthlyTopUsers } from "@/types/user.type";
import { useUsers } from "@/hooks/user";
import { formatCount } from "@/lib/formatCount";
import { ThumbsUp } from "lucide-react";

function RightSidebar() {
  const router = useRouter();
  const { getMonthlyTopUsers, loading, error } = useUsers();
  const [topUsers, setTopUsers] = useState<MonthlyTopUsers[]>([]);

  const handleGetTopUsers = async () => {
    const res = await getMonthlyTopUsers();
    console.log("res", res);
    if (res) {
      setTopUsers(res);
    }
  };

  useEffect(() => {
    if (loading) return;
    handleGetTopUsers();
  }, []);
  return (
    <aside className="w-full lg:w-[320px] space-y-6">
      <div className="rounded-2xl bg-purple-700 text-white p-5 shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🏆 Monthly Meme Challenge
        </h2>

        <p className="mt-3 text-sm">
          Theme: <span className="font-semibold">Future Tech Gone Wrong</span>
        </p>

        <div className="mt-2 flex justify-between text-sm">
          <span>
            Reward: <span className="font-semibold">$100 Gift Card</span>
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
      <div className="rounded-2xl bg-white p-5 shadow border-t-4 border-purple-500">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Top Creators (This Month)
        </h3>
        {error && (
          <p className="text-red-500 text-sm">Failed to load top creators</p>
        )}
        {loading && (
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

        <div className="space-y-4">
          {topUsers.map((user, index) => (
            <div
              key={user.user_id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/profile/${user.user_id}`)}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-500">#{index + 1}</span>

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
      </div>
    </aside>
  );
}

export default RightSidebar;
