'use client'

import React,{useState} from 'react'
import { useRouter, useParams } from "next/navigation";
import { useFriends } from "@/hooks/friends";

const Tabs = [
  "Friends",
  "Recently Added",
  "Mutual Friends",
  "Followers",
  "Following",
];

function Friends() {
    const params = useParams();
    const user_id = params.user_id as string;
    const [activeTab, setActiveTab] = useState("Friends");
    const { getFriends } = useFriends();
  
  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">
        Friends
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
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
        {activeTab === "Friends" && <div>Friends List</div>}
        {activeTab === "Recently Added" && <div>Recently Added List</div>}
        {activeTab === "Mutual Friends" && <div>Mutual Friends</div>}
        {activeTab === "Followers" && <div>Followers List</div>}
        {activeTab === "Following" && <div>Following List</div>}
      </div>
    </div>
  );
}

export default Friends