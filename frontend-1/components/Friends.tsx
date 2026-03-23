"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FollowData } from "@/types/user.type";

import { useUsers } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { MoreVertical } from "lucide-react";

interface ParentProps {
  user: FollowData;
}

// for followers and followings
function FollowCard({ user }: ParentProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:shadow-sm transition">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Profile Image */}
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
          <Image
            src={user.profile_pic || "/default.png"}
            alt={user.user_name}
            fill
            className="object-cover"
          />
        </div>

        {/* Name */}
        <div>
          <p className="text-sm sm:text-base md:text-lg font-medium text-gray-800">
            {user.user_name}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-2 sm:hidden w-full justify-end">
        {/* Follow Button */}
        <button className="px-3 py-1 text-xs rounded-full bg-primary text-white">
          {user.isFollowing ? "Unfollow" : "Follow"}
        </button>

        {/* Message Button */}
        <button className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-700">
          Message
        </button>
      </div>

      {/* ✅ DESKTOP MENU */}
      <button className="hidden sm:block mt-2 p-1 rounded-full hover:bg-gray-100">
        <MoreVertical size={16} />
      </button>
    </div>
  );
}

const Tabs = ["Followers", "Following"];

interface FriendProps {
  user_id: string;
  isOwnProfile: boolean;
}

function Friends({ user_id, isOwnProfile }: FriendProps) {
  const [activeTab, setActiveTab] = useState("Followers");
  const { user, isLoggedIn, isLoading } = useUser();
  const { getFollowers, getFollowings, loading, error } = useUsers();

  const [data, setData] = useState<FollowData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Logic
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (isLoading) return;
      if (loading || (!hasNext && !isInitial)) return;

      const currentCursor = isInitial ? null : cursor;

      let data;
      if (activeTab === "Followers") {
        data = await getFollowers(user_id, currentCursor); // Ensure your hook accepts 'active'
      } else if (activeTab === "Followings") {
        data = await getFollowings(user_id, currentCursor);
      }
      if (!data) return;

      if (isInitial) {
        setData(data.items);
      } else {
        setData((prev) => [...prev, ...data.items]);
      }

      setCursor(data.next_cursor);
      setHasNext(data.has_next);
    },
    [
      cursor,
      hasNext,
      loading,
      getFollowers,
      getFollowings,
      isLoading,
      user_id,
      activeTab,
    ],
  );

  // 2. Reset feed when Category changes
  useEffect(() => {
    if (isLoading) return;
    setData([]);
    setCursor(null);
    setHasNext(true);
    loadPosts(true);
  }, [activeTab, isLoading]);

  // 3. Infinite Scroll (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          loadPosts();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadPosts, hasNext, loading]);
  console.log(data);

  const tabClass = useCallback(
    (tab: string) =>
      `px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
        activeTab === tab
          ? "bg-purple-100 text-purple-700"
          : "hover:bg-gray-100 text-gray-500"
      }`,
    [activeTab],
  );

  return (
    <div className="grid grid-cols-1 gap-2 mt-5">
      {/* ================= STICKY TABS ================= */}
      <div className="sticky sm:top-35 top-55 z-10 bg-white pb-2">
        <div className="flex overflow-x-auto scrollbar-hide gap-1">
          <button
            className={tabClass("Followers")}
            onClick={() => setActiveTab("Followers")}
          >
            Followers
          </button>
          <button
            className={tabClass("Followings")}
            onClick={() => setActiveTab("Followings")}
          >
            Followings
          </button>
        </div>
      </div>

      {/* ================= FRIENDS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
        {activeTab === "Followers" &&
          data.map((user) => <FollowCard user={user} key={user.user_id} />)}
        {activeTab === "Followings" &&
          data.map((user) => <FollowCard user={user} key={user.user_id} />)}
      </div>
    </div>
  );
}

export default Friends;
