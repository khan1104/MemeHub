import React from "react"
import { useRouter } from "next/navigation";

const topCreators = [
  { rank: 1, name: "@MemeLord_5000", likes: "9.8K", color: "bg-yellow-400" },
  { rank: 2, name: "@VideoVibes_22", likes: "7.1K", color: "bg-green-400" },
  { rank: 3, name: "@DankMaster", likes: "5.4K", color: "bg-purple-400" },
]

function RightSidebar() {
  const router = useRouter();
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

        <button className="mt-4 w-full rounded-full bg-yellow-400 text-purple-900 font-bold py-2 hover:bg-yellow-300 transition"
        onClick={()=>router.push("/monthlyChallenege")}>
          View Details & Participate
        </button>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow border-t-4 border-purple-500">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Top Creators (This Month)
        </h3>

        <div className="space-y-4">
          {topCreators.map((creator) => (
            <div
              key={creator.rank}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-500">
                  #{creator.rank}
                </span>

                <div
                  className={`w-10 h-10 rounded-full ${creator.color}`}
                />

                <span className="font-medium text-gray-800">
                  {creator.name}
                </span>
              </div>

              <div className="flex items-center gap-1 text-purple-600 font-semibold">
                ❤️ {creator.likes}
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}

export default RightSidebar
