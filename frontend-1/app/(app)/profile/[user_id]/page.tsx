"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { useUser } from "@/context/UserContext";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";
import { usePostAction } from "@/hooks/postsAction";

import UserPostCard from "@/components/UserPostsCrad";
import ProfileHeader from "@/components/profile/ProfileHeader"
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

  const { getUserPosts } = usePost();

  const { getSavedPosts, getLikedPosts } = usePostAction();

  /* ================= STATE ================= */

  const [user, setUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const requestIdRef = useRef(0);

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
      if (loadingPosts) return;
      if (!hasNext && !isInitial) return;
      if (activeTab === "friends") return;

      const requestId = ++requestIdRef.current;

      setLoadingPosts(true);

      const currentCursor = isInitial ? null : cursor;

      let res;

      try {
        if (activeTab === "saved") {
          res = await getSavedPosts(currentCursor);
        } else if (activeTab === "liked") {
          res = await getLikedPosts(currentCursor);
        } else {
          res = await getUserPosts(user_id, activeTab, currentCursor);
        }

        if (!res) return;

        /* ignore old responses */
        if (requestId !== requestIdRef.current) return;

        setPosts((prev) => {
          if (isInitial) return res.items;

          const ids = new Set(prev.map((p) => p.post_id));
          const filtered = res.items.filter((p) => !ids.has(p.post_id));

          return [...prev, ...filtered];
        });

        setCursor(res.next_cursor);
        setHasNext(res.has_next);
      } finally {
        setLoadingPosts(false);
      }
    },
    [activeTab, cursor, hasNext, user_id],
  );

  /* ================= TAB CHANGE ================= */

  useEffect(() => {
    if (!user_id || isLoading) return;

    setPosts([]);
    setCursor(null);
    setHasNext(true);

    loadPosts(true);
  }, [activeTab, user_id, isLoading]);

  /* ================= INFINITE SCROLL ================= */

  useEffect(() => {
    if (!loaderRef.current) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadPosts();
      }
    });

    observerRef.current.observe(loaderRef.current);

    return () => observerRef.current?.disconnect();
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
            <ProfileHeaderSkeleton/>
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

        {/* POSTS GRID */}

        {activeTab !== "friends" && user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {posts.map((post) => (
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
                {loadingPosts && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                )}
              </div>
            )}
          </div>
        )}

        {!hasNext && posts.length > 0 && (
          <p className="text-center py-6 text-gray-400 text-sm">
            No more posts
          </p>
        )}

        {activeTab === "friends" && user && (
          <Friends user_id={user.user_id} isOwnProfile={isOwnProfile} />
        )}
      </div>
    </div>
  );
}
