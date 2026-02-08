"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Edit, Users, UserPlus,ChevronDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";
import { usePostAction } from "@/hooks/postsAction";

import UserPostCard from "@/components/UserPostsCrad";

import { Post } from "@/types/posts.type";
import { User } from "@/types/user.type";

export default function Profile() {
  /* ================= ROUTE ================= */
  const params = useParams();
  const user_id = params.user_id as string;
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const { user: currentUser, loadUser } = useUser();
  const isOwnProfile = currentUser?._id === user_id;

  /* ================= TABS ================= */
  const [activeTab, setActiveTab] = useState<
    "latest" | "top" | "oldest" | "saved" | "liked"
  >("latest");

  /* ================= HOOKS ================= */
  const { getUserById, updateProfilePic, FollowUser } = useUsers();

  const { fetchUserPosts, loading: postLoading } = usePost();

  const { fetchSavedPosts, fetchLikedPosts } = usePostAction();

  /* ================= STATE ================= */
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* ================= TAB STYLE ================= */
  const tabClass = (tab: string) =>
    `pb-3 border-b-2 whitespace-nowrap transition ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-gray-500 hover:text-primary"
    }`;

  /* ================= PROFILE PIC ================= */
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await updateProfilePic(file);
    if (res) {
      const updatedUser = await getUserById(user_id);
      if (updatedUser) setUser(updatedUser);
      await loadUser();
    }
  };

  /* ================= LOAD POSTS ================= */
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (postLoading || (!hasNext && !isInitial)) return;

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
        {/* ================= PROFILE HEADER ================= */}
        <div className="sticky top-0 left-0 z-10 py-6 -mt-6 bg-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* ---------- PROFILE IMAGE ---------- */}
            <div className="relative mx-auto md:mx-0">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border">
                <Image
                  src={user?.profile_pic || "/default-avatar.png"}
                  alt={user?.user_name || "User"}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>

              {isOwnProfile && (
                <button
                  className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow"
                  onClick={() => fileRef.current?.click()}
                >
                  <Edit size={14} />
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleChange}
                  />
                </button>
              )}
            </div>

            {/* ---------- USER INFO ---------- */}
            <div className="flex-1 text-center md:text-left">
              {/* Username always visible */}
              <h1 className="text-xl sm:text-2xl font-semibold">
                {user?.user_name}
              </h1>

              {/* -------- MOBILE COLLAPSIBLE -------- */}
              <details className="md:hidden mt-1 group ">
                <summary className="list-none cursor-pointer text-sm text-gray-500 flex items-center justify-center gap-1">
                  <span>View more</span>

                  <ChevronDown
                    size={16}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>

                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {user?.bio || "No bio available"}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm">
                    <div>
                      <span className="font-semibold">{user?.total_posts}</span>{" "}
                      Posts
                    </div>

                    <button
                      className="flex items-center gap-2 hover:text-purple-600"
                      onClick={() => router.push("/friends")}
                    >
                      <Users size={16} />
                      <span className="font-semibold">
                        {user?.total_friends}
                      </span>
                      Friends
                    </button>

                    <button
                      className="flex items-center gap-2 hover:text-purple-600"
                      onClick={() =>
                        router.push(`/profile/${user?._id}/followers`)
                      }
                    >
                      <UserPlus size={16} />
                      <span className="font-semibold">
                        {user?.total_followers}
                      </span>
                      Followers
                    </button>

                    <button
                      className="flex items-center gap-2 hover:text-purple-600"
                      onClick={() =>
                        router.push(`/profile/${user?._id}/following`)
                      }
                    >
                      <UserPlus size={16} />
                      <span className="font-semibold">
                        {user?.total_following}
                      </span>
                      Following
                    </button>
                  </div>

                  {/* Edit / Follow (mobile only inside details) */}
                  <div className="mt-3">
                    {isOwnProfile ? (
                      <button
                        onClick={() => router.push("/settings")}
                        className="w-full bg-primary text-white px-5 py-2 rounded-xl"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className="w-full bg-primary text-white px-5 py-2 rounded-xl"
                      >
                        {user?.isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              </details>

              {/* -------- DESKTOP INFO (UNCHANGED) -------- */}
              <div className="hidden md:block">
                <p className="mt-1 text-sm text-gray-600">
                  {user?.bio || "No bio available"}
                </p>

                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <div>
                    <span className="font-semibold">{user?.total_posts}</span>{" "}
                    Posts
                  </div>

                  <button
                    className="flex items-center gap-2 hover:text-purple-600"
                    onClick={() => router.push("/friends")}
                  >
                    <Users size={16} />
                    <span className="font-semibold">{user?.total_friends}</span>
                    Friends
                  </button>

                  <button
                    className="flex items-center gap-2 hover:text-purple-600"
                    onClick={() =>
                      router.push(`/profile/${user?._id}/followers`)
                    }
                  >
                    <UserPlus size={16} />
                    <span className="font-semibold">
                      {user?.total_followers}
                    </span>
                    Followers
                  </button>

                  <button
                    className="flex items-center gap-2 hover:text-purple-600"
                    onClick={() =>
                      router.push(`/profile/${user?._id}/following`)
                    }
                  >
                    <UserPlus size={16} />
                    <span className="font-semibold">
                      {user?.total_following}
                    </span>
                    Following
                  </button>
                </div>
              </div>
            </div>

            {/* ---------- EDIT / FOLLOW (DESKTOP) ---------- */}
            <div className="hidden md:block">
              {isOwnProfile ? (
                <button
                  onClick={() => router.push("/settings")}
                  className="bg-primary text-white px-5 py-2 rounded-xl"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="bg-primary text-white px-5 py-2 rounded-xl"
                >
                  {user?.isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {/* ---------- TABS ---------- */}
          <div className="mt-6 flex gap-6 border-b text-sm font-medium overflow-x-auto">
            <button
              className={tabClass("latest")}
              onClick={() => setActiveTab("latest")}
            >
              Home
            </button>
            <button
              className={tabClass("top")}
              onClick={() => setActiveTab("top")}
            >
              Most Liked
            </button>
            <button
              className={tabClass("oldest")}
              onClick={() => setActiveTab("oldest")}
            >
              Oldest
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
        <div id="profile-scroll" className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}

// check
