"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";
import { usePostAction } from "@/hooks/postsAction";

import UserPostCard from "@/components/UserPostsCrad";
import ProfileHeader from "@/components/ProfileHeader";
import Friends from "@/components/Friends";

import { Post } from "@/types/posts.type";
import { User } from "@/types/user.type";

export default function Profile() {
  /* ================= ROUTE ================= */
  const params = useParams();
  const user_id = params.user_id as string;

  const { user: currentUser, loadUser } = useUser();
  const isOwnProfile = currentUser?._id === user_id;

  /* ================= TABS ================= */
  const [activeTab, setActiveTab] = useState<
    "latest" | "top" | "oldest" | "friends"|"saved" | "liked"
  >("latest");

  /* ================= HOOKS ================= */
  const {
    getUserById,
    updateProfilePic,
    FollowUser,
    loading: userLoading,
    error: userError,
  } = useUsers();

  const { fetchUserPosts, loading: postLoading, error: postError } = usePost();

  const {
    fetchSavedPosts,
    fetchLikedPosts,
    loading: postActionLoading,
    error: postActionError,
  } = usePostAction();

  /* ================= STATE ================= */
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);




  /* ================= LOAD POSTS ================= */
  const loadPosts = useCallback(
    async (isInitial = false) => {
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
    ],
  );

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!user_id) return;

    const loadProfile = async () => {
      const user = await getUserById(user_id);
      if (user) setUser(user);

      setPosts([]);
      setCursor(null);
      setHasNext(true);

      loadPosts(true);
    };

    loadProfile();
  }, [user_id, activeTab]);

  /* ================= INFINITE SCROLL ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !postLoading) {
          loadPosts();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadPosts, hasNext, postLoading]);

  /* ================= FOLLOW ================= */
  const handleFollow = async () => {
    if (!user?._id) return;

    await FollowUser(user._id);
    const updated = await getUserById(user_id);
    if (updated) setUser(updated);
  };
  const handleDeleteLocal = (id: string) => {
    setPosts((prev) => prev.filter((post) => post._id !== id));

    setUser((prev) =>
      prev
        ? {
            ...prev,
            total_posts: Math.max(0, prev.total_posts - 1),
          }
        : prev,
    );
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-6">
      <div className="flex-1 flex flex-col">
        {/* ================= PROFILE HEADER ================= */}
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onFollow={handleFollow}
          onChangeProfilePic={async (file) => {
            const res = await updateProfilePic(file);
            if (res) {
              const updatedUser = await getUserById(user_id);
              if (updatedUser) setUser(updatedUser);
              await loadUser();
            }
          }}
        />
        {/* ================= CONTENT ================= */}
        {activeTab === "friends" ? (
          <Friends />
        ) : (
          <>
            {/* ================= POSTS GRID ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <UserPostCard
                  key={post._id}
                  post={post}
                  onDelete={handleDeleteLocal}
                />
              ))}
            </div>

            {postLoading && (
              <p className="text-center py-6 text-gray-500">
                Loading more posts...
              </p>
            )}

            {!hasNext && posts.length > 0 && (
              <p className="text-center py-6 text-gray-400 text-sm">
                No more posts
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// check
