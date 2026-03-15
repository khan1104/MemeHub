"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";
import { usePostAction } from "@/hooks/postsAction";

import UserPostCard from "@/components/UserPostsCrad";
import ProfileHeader from "@/components/ProfileHeader";

import { Post } from "@/types/posts.type";
import { User } from "@/types/user.type";
import Friends from "@/components/Friends";

export default function Profile() {
  /* ================= ROUTE ================= */
  const params = useParams();
  const user_id = params.user_id as string;

  const { user: currentUser,isLoading } = useUser();
  const isOwnProfile = currentUser?.user_id === user_id;

  /* ================= TABS ================= */
  const [activeTab, setActiveTab] = useState<
    "latest" | "top" | "oldest" | "friends"| "saved" | "liked"
  >("latest");

  /* ================= HOOKS ================= */
  const {
    getUserById,
    FollowUser,
    loading: userLoading,
    error: userError,
  } = useUsers();

  const { fetchUserPosts, loading: usePostLoading, error: postError } = usePost();

  const {
    fetchSavedPosts,
    fetchLikedPosts,
    loading: postActionLoading,
    error: postActionError,
  } = usePostAction();

  const postLoading = usePostLoading || postActionLoading;

  /* ================= STATE ================= */
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* ================= LOAD POSTS ================= */
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (isLoading) return;
      if (postLoading || (!hasNext && !isInitial)) return;
      if (activeTab === "friends") return;

      const currentCursor = isInitial ? null : cursor;
      let res;

      if (activeTab === "saved") {
        res = await fetchSavedPosts(currentCursor);
      } else if (activeTab === "liked") {
        res = await fetchLikedPosts(currentCursor);
      } else {
        res = await fetchUserPosts(user_id, activeTab, currentCursor);
      }

      if (!res) return;

      setPosts((prev) => (isInitial ? res.items : [...prev, ...res.items]));

      setCursor(res.next_cursor);
      setHasNext(res.has_next);
    },
    [
      activeTab,
      cursor,
      hasNext,
      postLoading,
      user_id,
      fetchUserPosts,
      fetchSavedPosts,
      fetchLikedPosts,
      isLoading
    ],
  );


  useEffect(() => {
    if (!user_id || isLoading) return;

    const loadProfile = async () => {
      const user = await getUserById(user_id);
      if (user) setUser(user);
    };

    loadProfile();
  }, [user_id, isLoading]);

  useEffect(() => {
      if (!user_id || isLoading) return;

      setPosts([]);
      setCursor(null);
      setHasNext(true);

      loadPosts(true);
    }, [activeTab, user_id, isLoading]);

  /* ================= INFINITE SCROLL ================= */
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !postLoading) {
        loadPosts();
      }
    });

    observerRef.current.observe(loaderRef.current);

    return () => observerRef.current?.disconnect();
  }, [loadPosts, hasNext, postLoading]);

  /* ================= FOLLOW ================= */
  const handleFollow = async () => {
    if (!user?.user_id) return;

    await FollowUser(user.user_id);
    const updated = await getUserById(user_id);
    if (updated) setUser(updated);
  };
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
  const tabClass = useCallback(
    (tab: string) =>
      `pb-2 border-b-2 cursor-pointer whitespace-nowrap transition ${
        activeTab === tab
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-primary"
      }`,
    [activeTab],
  );

  console.log(posts)
  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 pt-6">
      <div className="flex-1 flex flex-col">
        {/* ================= PROFILE HEADER ================= */}
        <div className="sticky top-0 left-0 z-10 -mt-6 bg-white">
          <ProfileHeader
            user={user}
            isOwnProfile={isOwnProfile}
            onFollow={handleFollow}
          />
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
              friends
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
                  Liked Posts
                </button>
              </>
            )}
          </div>
        </div>
        {/* ================= POSTS GRID ================= */}

        {activeTab !== "friends" && user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {posts.map((post) => (
              <UserPostCard
                key={post.post_id}
                post={post}
                onDelete={handleDeleteLocal}
              />
            ))}
            <div
              ref={loaderRef}
              className="h-10 flex items-center justify-center"
            >
              {postLoading && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
              )}
            </div>
          </div>
        )}
        {!hasNext && posts.length > 0 && (
          <p className="text-center py-6 text-gray-400 text-sm">
            No more posts
          </p>
        )}
        {activeTab === "friends" && user && (
          <Friends
            user_id={user.user_id}
            isOwnProfile={isOwnProfile}
            key={user_id}
          />
        )}
      </div>
    </div>
  );
}

// check
