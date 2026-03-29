"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FollowData } from "@/types/user.type";
import { Request } from "@/types/friends.type";

import { useUsers } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { MoreVertical } from "lucide-react";
import { FaCheck } from "react-icons/fa6";
import { X } from "lucide-react";
import { useFriends } from "@/hooks/friends";

interface FollowProps {
  user: FollowData;
}

// for followers and followings
function FollowCard({ user }: FollowProps) {
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

type Purpose = "Recived" | "Sent";
interface RequestsProps {
  request: Request;
  purpose: Purpose;
  handleFriendRequest: (
    request_id: string,
    action: "accepted" | "rejected",
  ) => void;
}

function Requests({ request, purpose,handleFriendRequest }: RequestsProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:shadow-sm transition">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
          <Image
            src={request.profile_pic || "/default.png"}
            alt={request.user_name}
            fill
            className="object-cover"
          />
        </div>

        <p className="text-sm sm:text-base md:text-lg font-medium text-gray-800">
          {request.user_name}
        </p>
      </div>

      {/* RIGHT SECTION */}
      {purpose === "Recived" ? (
        <>
          {/* ✅ MOBILE */}
          <div className="flex gap-2 sm:hidden">
            <button
              className="px-4 py-1 text-sm rounded-2xl bg-primary text-white"
              onClick={() => handleFriendRequest(request.id, "accepted")}
            >
              Accept
            </button>

            <button
              className="px-4 py-1 text-sm rounded-2xl bg-gray-200"
              onClick={() => handleFriendRequest(request.id, "rejected")}
            >
              Reject
            </button>
          </div>

          {/* ✅ DESKTOP */}
          <div className="hidden sm:flex gap-2">
            <button
              className="p-2 rounded-full bg-primary text-white hover:scale-105 transition"
              onClick={() => handleFriendRequest(request.id, "accepted")}
            >
              <FaCheck size={18} />
            </button>

            <button
              className="p-2 rounded-full bg-gray-200 hover:scale-105 transition"
              onClick={() => handleFriendRequest(request.id, "rejected")}
            >
              <X size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ✅ MOBILE */}
          <div className="flex sm:hidden">
            <button className="px-4 py-1 text-md rounded-md bg-gray-200">
              Cancel
            </button>
          </div>

          {/* ✅ DESKTOP */}
          <div className="hidden sm:block">
            <button className="px-4 py-1 text-md rounded-md bg-gray-200">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const Tabs = ["Followers", "Following", "Requests", "Sent Requests"];

interface FriendProps {
  user_id: string;
  isOwnProfile: boolean;
}

function Friends({ user_id, isOwnProfile }: FriendProps) {
  const [activeTab, setActiveTab] = useState("Followers");
  const { user, isLoggedIn, isLoading } = useUser();
  const {
    getFollowers,
    getFollowings,
    loading: userLoading,
    error: userError,
  } = useUsers();
  const {
    getSentRequests,
    getReciveRequests,
    handleReciveRequest,
    loading: friendLoading,
    error: friendError,
  } = useFriends();

  const [data, setData] = useState<FollowData[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loading = userLoading || friendLoading;

  // 1. Fetch Logic
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (isLoading) return;
      if (loading || (!hasNext && !isInitial)) return;

      const currentCursor = isInitial ? null : cursor;

      let response;
      if (activeTab === "Followers") {
        response = await getFollowers(user_id, currentCursor); // Ensure your hook accepts 'active'
      } else if (activeTab === "Followings") {
        response = await getFollowings(user_id, currentCursor);
      } else if (activeTab === "Requests") {
        response = await getReciveRequests(currentCursor);
      } else if (activeTab === "Sent Requests") {
        response = await getSentRequests(currentCursor);
      }
      if (!response) return;

      if (isInitial) {
        if (activeTab === "Followers") {
          setData(response.items); 
        } else if (activeTab === "Followings") {
          setData(response.items);
        } else if (activeTab === "Requests") {
          setRequests(response.items);
        } else if (activeTab === "Sent Requests") {
          setRequests(response.items);
        }
      } else {
        if (activeTab === "Followers") {
          setData((prev) => [...prev, ...response.items]);
        } else if (activeTab === "Followings") {
          setData((prev) => [...prev, ...response.items]);
        } else if (activeTab === "Requests") {
          setRequests((prev) => [...prev, ...response.items]);
        } else if (activeTab === "Sent Requests") {
          setRequests((prev) => [...prev, ...response.items]);
        }

      }

      setCursor(response.next_cursor);
      setHasNext(response.has_next);
    },
    [
      cursor,
      hasNext,
      loading,
      getFollowers,
      getFollowings,
      getReciveRequests,
      getSentRequests,
      isLoading,
      user_id,
      activeTab,
    ],
  );

  // 2. Reset feed when Category changes
  useEffect(() => {
    if (isLoading) return;
    setData([]);
    setRequests([]);
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

  const handleRequest=async(request_id:string,action:string)=>{
    const res=await handleReciveRequest(request_id,action);
    console.log("mai call huwa")
    console.log(res)
  }


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
          {isOwnProfile && (
            <>
              <button
                className={tabClass("Requests")}
                onClick={() => setActiveTab("Requests")}
              >
                Requests
              </button>
              <button
                className={tabClass("Sent Requests")}
                onClick={() => setActiveTab("Sent Requests")}
              >
                Sent Requests
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= FRIENDS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
        {activeTab === "Followers" &&
          data.map((user) => <FollowCard user={user} key={user.user_id} />)}
        {activeTab === "Followings" &&
          data.map((user) => <FollowCard user={user} key={user.user_id} />)}
        {isOwnProfile &&
          activeTab === "Requests" &&
          requests.map((request) => (
            <Requests
              request={request}
              key={request.user_id}
              purpose="Recived"
              handleFriendRequest={handleRequest}
            />
          ))}
        {isOwnProfile &&
          activeTab === "Sent Requests" &&
          requests.map((request) => (
            <Requests
              request={request}
              key={request.user_id}
              purpose="Sent"
              handleFriendRequest={handleRequest}
            />
          ))}
      </div>
    </div>
  );
}

export default Friends;
