"use client";
import React, { useEffect, useState } from "react";
import { useFriends } from "@/hooks/friends";

const Tabs = [
  "Friends",
  "Recently Added",
  "Mutual Friends",
  "Followers",
  "Following",
  "Requests",
  "Sent Requests",
];

interface FriendProps {
  user_id: string;
}

function Friends({ user_id }: FriendProps) {
  const [activeTab, setActiveTab] = useState("Friends");
  const { getFriends } = useFriends();
  
  return (
    <div className="grid grid-cols-1 gap-2 mt-5">
      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide sticky">
        {Tabs.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(item)}
            className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
              ${
                activeTab === item
                  ? "bg-purple-100 text-purple-700"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <div>
        <button className="h-100 w-20">hello</button>
        </div>
      </div>
      
    </div>
  );
}

export default Friends;


