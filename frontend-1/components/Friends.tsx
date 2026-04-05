"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import ConnectionSkeleton from "./skeletons/Connections";
import Connections from "./Connections";
import Request from "./Requests";
import { useUsers } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { useFriends } from "@/hooks/friends";

interface FriendProps {
  user_id: string;
  isOwnProfile: boolean;
}

function Friends({ user_id, isOwnProfile }: FriendProps) {
  const [activeTab, setActiveTab] = useState("Followers");
  const { isLoggedIn, isLoading: authLoading } = useUser();

  const {
    getFollowers,
    getFollowings,
    followUser,
    loading: userLoading,
    error: userError,
    setError:userSetError
  } = useUsers();
  const {
    getSentRequests,
    getReciveRequests,
    handleReciveRequest,
    cancelRequest,
    getFriends,
    getMutualFriends,
    removeFriend,
    loading: friendLoading,
    error: friendError,
    setError:friendSetError
  } = useFriends();

  // Unified state to reduce boilerplate
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  const loading = userLoading || friendLoading;
  const error = friendError || userError;


  const clearErrors = () => {
    userSetError(null);
    friendSetError(null);
  };

  const loadData = useCallback(
    async (isInitial = false) => {
      if (authLoading || fetchingRef.current) return;
      if (!hasNext && !isInitial) return;

      fetchingRef.current = true;
      const currentCursor = isInitial ? null : cursor;

      try {
        let response: any;

        // Strategy pattern for fetching
        switch (activeTab) {
          case "Followers":
            response = await getFollowers(user_id, currentCursor);
            break;
          case "Followings":
            response = await getFollowings(user_id, currentCursor);
            break;
          case "Requests":
            response = await getReciveRequests(currentCursor);
            break;
          case "Sent Requests":
            response = await getSentRequests(currentCursor);
            break;
          case "Friends":
            response = await getFriends(user_id, "oldest", currentCursor);
            break;
          case "Recently added":
            response = await getFriends(user_id, "latest", currentCursor);
            break;
          case "Mutual Friends":
            response = await getMutualFriends(user_id, currentCursor);
            break;
        }

        if (response) {
          setItems((prev) =>
            isInitial ? response.items : [...prev, ...response.items],
          );
          setCursor(response.next_cursor);
          setHasNext(response.has_next);
        } else {
          setHasNext(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        fetchingRef.current = false;
      }
    },
    [
      activeTab,
      authLoading,
      cursor,
      hasNext,
      user_id,
      getFollowers,
      getFollowings,
      getReciveRequests,
      getSentRequests,
      getFriends,
      getMutualFriends,
    ],
  );

  // Reset and Load on Tab Change
  useEffect(() => {
    clearErrors();
    setItems([]); // Clear UI immediately for better UX
    setHasNext(true);
    setCursor(null);
    loadData(true);
  }, [activeTab, user_id]); // Added user_id in case profile changes

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNext &&
          !fetchingRef.current &&
          !loading
        ) {
          loadData();
        }
      },
      { rootMargin: "200px" },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadData, hasNext, loading]);

  // Actions
  const handleUnfollow = async (targetId: string) => {
    
      const res=await followUser(targetId);
      if (!res) {
        toast.error("something went wrong");
        clearErrors();
        return;
      }
      if (activeTab === "Followings") {
        setItems((prev) => prev.filter((u) => u.user_id !== targetId));
      }
  };


  const handleRequest = async (request_id: string, action: string) => {
      const res=await handleReciveRequest(request_id, action);
      if (!res) {
        toast.error("something went wrong");
        clearErrors();
        return;
      }
      toast.success(`Request ${action}`);
      setItems((prev) => prev.filter((request) => request.id !== request_id));
    
  };

  const handleCancelRequest = async (user_id: string) => {
      const res=await cancelRequest(user_id);
      if(!res){
        toast.error('something went wrong');
        clearErrors();
        return;
      }
      toast.success("Request cancelled");
      setItems((prev) => prev.filter((user) => user.user_id !== user_id));
  };

    const handleUnfriend = async (user_id: string) => {
        const res=await removeFriend(user_id);
        if (!res) {
          toast.error("something went wrong");
          clearErrors();
          return;
        }
        toast.success("Friend Removed");
        setItems((prev) => prev.filter((user) => user.user_id !== user_id));
      
    };


  const renderItem = (item: any) => {
    if (activeTab === "Requests" || activeTab === "Sent Requests") {
      return (
        <Request
          key={item.user_id}
          request={item}
          purpose={activeTab === "Requests" ? "Recived" : "Sent"}
          handleFriendRequest={handleRequest}
          handleCancelRequest={handleCancelRequest}
        />
      );
    }

    return (
      <Connections
        key={item.user_id}
        user={item}
        handleUnfriend={handleUnfriend}
        handleFollow={handleUnfollow}
        handleUnFollow={handleUnfollow}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 gap-2 mt-5">
      <div className="sticky sm:top-35 top-55 z-10 bg-white pb-2">
        <div className="flex overflow-x-auto scrollbar-hide gap-1">
          {[
            "Followers",
            "Followings",
            "Friends",
            "Recently added",
            "Mutual Friends",
            "Requests",
            "Sent Requests",
          ].map((tab) => {
            if (!isLoggedIn && tab !== "Followers" && tab !== "Followings")
              return null;
            if (tab === "Mutual Friends" && isOwnProfile) return null;
            if (
              (tab === "Requests" || tab === "Sent Requests") &&
              !isOwnProfile
            )
              return null;

            return (
              <button
                key={tab}
                className={`p-3 whitespace-nowrap rounded-xl text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-purple-100 text-purple-700"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
      {error && items.length === 0 && !loading && (
        <div className="col-span-full text-center py-5 text-red-500 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {items.map(renderItem)}

        {loading && [...Array(4)].map((_, i) => <ConnectionSkeleton key={i} />)}

        {!error && !loading && items.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            No results found.
          </div>
        )}

        <div ref={loaderRef} className="h-10 w-full" />
      </div>
    </div>
  );
}

export default Friends;
