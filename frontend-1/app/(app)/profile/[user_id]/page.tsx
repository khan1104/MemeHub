"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { useUser } from "@/context/UserContext";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";
import { usePostAction } from "@/hooks/postsAction";

import UserPostCard from "@/components/UserPostsCrad";
import UserPostCardSkeleton from "@/components/skeletons/UserPostCard";
import ProfileHeader from "@/components/ProfileHeader"
import ProfileHeaderSkeleton from "@/components/skeletons/ProfileHeader";
import Friends from "@/components/Friends";

import { Post } from "@/types/posts.type";
import { User } from "@/types/user.type";

export default function Profile() {
  /* ================= ROUTE ================= */
  const params = useParams();
  const user_id = params.user_id as string;

  const { user: currentUser, isLoading } = useUser();
  const isOwnProfile = currentUser?.user_id === user_id;

  /* ================= TAB ================= */

  const [activeTab, setActiveTab] = useState<
    "latest" | "top" | "oldest" | "friends" | "saved" | "liked"
  >("latest");

  /* ================= HOOKS ================= */

  const { getUserById} = useUsers();

  const { getUserPosts ,loading:usersPostLoading,error:userPostError,setError:userPostSetError} = usePost();

  const { getSavedPosts, getLikedPosts,loading:postsLoading,error:postError,setError:postSetError } = usePostAction();

  const loading=usersPostLoading || postsLoading;
  const error=userPostError || postError

  /* ================= STATE ================= */

  const [user, setUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // const requestIdRef = useRef(0);
  const fetchingRef = useRef(false);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {

    if (!user_id || isLoading) return;

    const loadProfile = async () => {
      const data = await getUserById(user_id);
      if (data) setUser(data);
    };

    loadProfile();
  }, [user_id, isLoading]);

  /* ================= LOAD POSTS ================= */

  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (fetchingRef.current) return;
      if (isLoading) return;
      if (loading) return;
      if (!hasNext && !isInitial) return;
      if (activeTab === "friends") return;

      fetchingRef.current = true;

      const currentCursor = isInitial ? null : cursor;

      let res;

      
        if (activeTab === "saved") {
          res = await getSavedPosts(currentCursor);
        } else if (activeTab === "liked") {
          res = await getLikedPosts(currentCursor);
        } else {
          res = await getUserPosts(user_id, activeTab, currentCursor);
        }

        if (!res) {
          setHasNext(false);
          fetchingRef.current = false;
          return;
        }

        if (res) {
          if (isInitial) {
            setPosts(res.items);
          } else {
            setPosts((prev) => [...prev, ...res.items]);
          }

          setCursor(res.next_cursor);
          setHasNext(res.has_next);
        }

        fetchingRef.current = false;
      
    },
    [activeTab, cursor, hasNext, user_id,isLoading,loading,getLikedPosts,getSavedPosts,getUserPosts],
  );

  /* ================= TAB CHANGE ================= */

  useEffect(() => {
    if (!user_id || isLoading) return;
    fetchingRef.current = false;
    userPostSetError(null);
    postSetError(null);
    setPosts([]);
    setCursor(null);
    setHasNext(true);

    loadPosts(true);
  }, [activeTab, user_id]);

  /* ================= INFINITE SCROLL ================= */
   useEffect(() => {
      const currentLoader = loaderRef.current;
      if (!currentLoader) return;
  
      const observer = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && hasNext && !fetchingRef.current) {
            loadPosts();
          }
        },
        {
          rootMargin: "150px", // preload before reaching bottom
          threshold: 0,
        },
      );
  
      observer.observe(currentLoader);
  
      return () => {
        if (currentLoader) observer.disconnect();;
      };
    }, [hasNext, loadPosts]);


  const handleDeleteLocal = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.post_id !== id));

    setUser((prev) =>
      prev
        ? {
            ...prev,
            total_posts: Math.max(0, prev.total_posts - 1),
          }
        : prev,
    );
  };

  /* ================= TAB STYLE ================= */

  const tabClass = (tab: string) =>
    `pb-2 border-b-2 cursor-pointer whitespace-nowrap transition ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-gray-500 hover:text-primary"
    }`;

  /* ================= UI ================= */

  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 pt-6">
      <div className="flex-1 flex flex-col">
        {/* PROFILE HEADER */}

        <div className="sticky top-0 left-0 z-10 -mt-6 bg-white">
          {!user ? (
            <ProfileHeaderSkeleton />
          ) : (
            <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
          )}

          <div className="mt-6 flex gap-4 border-b text-sm font-medium overflow-x-auto">
            <button
              className={tabClass("latest")}
              onClick={() => setActiveTab("latest")}
            >
              New
            </button>

            <button
              className={tabClass("top")}
              onClick={() => setActiveTab("top")}
            >
              Top
            </button>

            <button
              className={tabClass("oldest")}
              onClick={() => setActiveTab("oldest")}
            >
              Oldest
            </button>

            <button
              className={tabClass("friends")}
              onClick={() => setActiveTab("friends")}
            >
              Friends
            </button>

            {isOwnProfile && (
              <>
                <button
                  className={tabClass("saved")}
                  onClick={() => setActiveTab("saved")}
                >
                  Saved
                </button>

                <button
                  className={tabClass("liked")}
                  onClick={() => setActiveTab("liked")}
                >
                  Liked
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab !== "friends" && !error && !loading && posts.length === 0 && (
          <div className="w-full flex justify-center items-center py-10">
            <p className="text-gray-400 text-sm">
              {activeTab === "liked"
                ? "You haven’t liked any posts yet"
                : activeTab === "saved"
                  ? "You haven’t saved any posts yet"
                  : isOwnProfile
                    ? "You haven’t posted anything yet"
                    : "This user doesn’t have any posts yet"}
            </p>
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-10 text-red-500">{error}.</div>
        )}
        {/* POSTS GRID */}

        {activeTab !== "friends" && user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {loading && posts.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <UserPostCardSkeleton key={i} />
                ))
              : posts.map((post) => (
                  <UserPostCard
                    key={post.post_id}
                    post={post}
                    onDelete={handleDeleteLocal}
                  />
                ))}

            {hasNext && (
              <div
                ref={loaderRef}
                className="h-10 flex items-center justify-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "friends" && user && !error &&  (
          <Friends user_id={user.user_id} isOwnProfile={isOwnProfile} />
        )}
      </div>
    </div>
  );
}
