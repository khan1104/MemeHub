"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useFriends } from "@/hooks/friends";
import { FollowData } from "@/types/user.type";
import { Friend, Request } from "@/types/friends.type";
import { useUsers } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { MoreHorizontal } from "lucide-react";

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
  isOwnProfile: boolean;
}

function FriendCard({ user }: { user: Friend }) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition w-full">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden">
          <Image
            src={user.profile_pic}
            alt={user.user_name}
            fill
            className="object-cover"
          />
        </div>

        <p className="font-medium text-gray-800 text-sm sm:text-base md:text-lg line-clamp-1">
          {user.user_name}
        </p>
      </div>

      <button className="p-1 sm:p-2 rounded-full hover:bg-gray-200 transition">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}

function FollowCard({ user }: { user: FollowData }) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition w-full">
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden">
        <Image
          src={user.profile_pic}
          alt={user.user_name}
          fill
          className="object-cover"
        />
      </div>

      <p className="font-medium text-gray-800 text-sm sm:text-base md:text-lg line-clamp-1">
        {user.user_name}
      </p>
    </div>
  );
}

function RequestCard({ user }: { user: Request }) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition w-full">
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden">
        <Image
          src={user.profile_pic}
          alt={user.user_name}
          fill
          className="object-cover"
        />
      </div>

      <p className="font-medium text-gray-800 text-sm sm:text-base md:text-lg line-clamp-1">
        {user.user_name}
      </p>
    </div>
  );
}

export default function Friends({ user_id }: FriendProps) {
  const { isLoading } = useUser();

  const { getFriends, getMutualFriends, getRequests, getSentRequests } =
    useFriends();

  const { getFollowers, getFollowings } = useUsers();

  const [activeTab, setActiveTab] = useState("Friends");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [followData, setFollowData] = useState<FollowData[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadData = useCallback(
    async (isInitial = false) => {
      if (isLoading) return;
      if (!hasNext && !isInitial) return;

      const currentCursor = isInitial ? null : cursor;

      let data;

      switch (activeTab) {
        case "Friends":
          data = await getFriends(user_id, "oldest", currentCursor);
          break;

        case "Recently Added":
          data = await getFriends(user_id, "latest", currentCursor);
          break;

        case "Mutual Friends":
          data = await getMutualFriends(user_id, currentCursor);
          break;

        case "Followers":
          data = await getFollowers(user_id, currentCursor);
          break;

        case "Following":
          data = await getFollowings(user_id, currentCursor);
          break;

        case "Requests":
          data = await getRequests(currentCursor);
          break;

        case "Sent Requests":
          data = await getSentRequests(currentCursor);
          break;
      }

      if (!data) return;

      if (isInitial) {
        if (
          activeTab === "Friends" ||
          activeTab === "Recently Added" ||
          activeTab === "Mutual Friends"
        ) {
          setFriends(data.items);
        }

        if (activeTab === "Followers" || activeTab === "Following") {
          setFollowData(data.items);
        }

        if (activeTab === "Requests" || activeTab === "Sent Requests") {
          setRequests(data.items);
        }
      } else {
        if (
          activeTab === "Friends" ||
          activeTab === "Recently Added" ||
          activeTab === "Mutual Friends"
        ) {
          setFriends((prev) => [...prev, ...data.items]);
        }

        if (activeTab === "Followers" || activeTab === "Following") {
          setFollowData((prev) => [...prev, ...data.items]);
        }

        if (activeTab === "Requests" || activeTab === "Sent Requests") {
          setRequests((prev) => [...prev, ...data.items]);
        }
      }

      setCursor(data.next_cursor);
      setHasNext(data.has_next);
    },
    [
      activeTab,
      cursor,
      hasNext,
      isLoading,
      user_id,
      getFriends,
      getMutualFriends,
      getFollowers,
      getFollowings,
      getRequests,
      getSentRequests,
    ],
  );

  useEffect(() => {
    if (isLoading) return;

    setFriends([]);
    setFollowData([]);
    setRequests([]);
    setCursor(null);
    setHasNext(true);

    loadData(true);
  }, [activeTab, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext) {
          loadData();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadData, hasNext]);
  console.log("hello frienfd")

  return (
    <div className="grid grid-cols-1 gap-2 mt-4">
  
        {
          friends.map((friend) => (
            <FriendCard key={friend.user_id} user={friend} />
          ))}

        
      </div>
  );
}
