"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Edit, Users, UserPlus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";

import UserPostCard from "@/components/UserPostsCrad";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";

import { Post } from "@/types/posts.type";
import { User } from "@/types/user.type";

export default function Profile() {
  /* -------------------- ROUTE PARAM -------------------- */
  const params = useParams();
  const user_id = params.user_id as string;
  const { user: currentUser, loadUser } = useUser();
  const isOwnProfile = currentUser?._id === user_id;
  const [activeTab,setActiveTab]=useState("latest");

  /* -------------------- HOOKS -------------------- */
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const { getUserById, updateProfilePic, FollowUser, loading, error } =
    useUsers();

  const { fetchUserPosts, loading: postLoading, error: postError } = usePost();

  /* -------------------- STATE -------------------- */
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* -------------------- PROFILE PIC CHANGE -------------------- */
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user_id) return;

    const res = await updateProfilePic(file);
    if (res) {
      const updatedUser = await getUserById(user_id);
      if (updatedUser) setUser(updatedUser);
      await loadUser();
    }
  };

  /* -------------------- LOAD POSTS -------------------- */
  const loadPosts = useCallback(
    async (isInitial = false) => {
      if (postLoading || (!hasNext && !isInitial)) return;

      const currentCursor = isInitial ? null : cursor;
      const res = await fetchUserPosts(user_id,activeTab ,currentCursor);

      if (!res) return;

      if (isInitial) {
        setPosts(res.items);
      } else {
        setPosts((prev) => [...prev, ...res.items]);
      }

      setCursor(res.next_cursor);
      setHasNext(res.has_next);
    },
    [user_id, cursor,activeTab ,hasNext, postLoading, fetchUserPosts],
  );

  /* -------------------- LOAD USER -------------------- */
  useEffect(() => {
    if (!user_id) return;

    const loadProfile = async () => {
      const u = await getUserById(user_id);
      if (u) setUser(u);

      setCursor(null);
      setHasNext(true);
      setPosts([]);

      loadPosts(true);
    };

    loadProfile();
  }, [user_id]);

  /* -------------------- INFINITE SCROLL -------------------- */
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

  const handleFollow = async () => {
    await FollowUser(user?._id);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-6">
      <div className="flex-1 flex flex-col">
        {/* ================= PROFILE HEADER ================= */}
        <div className="sticky top-0 left-0 z-10 py-6 -mt-6 bg-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* ---------- PROFILE IMAGE ---------- */}
            <div className="relative mx-auto md:mx-0">
              <div className="w-[110px] h-[110px] rounded-full overflow-hidden border">
                <Image
                  src={user?.profile_pic || "/default-avatar.png"}
                  alt={user?.user_name || "User"}
                  width={110}
                  height={110}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Edit profile pic */}
              {isOwnProfile && (
                <>
                  <button
                    className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Edit size={14} />
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleChange}
                  />
                </>
              )}

              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleChange}
              />
            </div>

            {/* ---------- USER INFO ---------- */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {user?.user_name}
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                {user?.bio || "No bio available"}
              </p>

              {/* ---------- STATS ---------- */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 text-sm">
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
                  </span>{" "}
                  Friends
                </button>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() => router.push(`/profile/${user?._id}/followers`)}
                >
                  <UserPlus size={16} />
                  <span className="font-semibold">
                    {user?.total_followers}
                  </span>{" "}
                  Followers
                </button>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() => router.push(`/profile/${user?._id}/following`)}
                >
                  <UserPlus size={16} />
                  <span className="font-semibold">
                    {user?.total_following}
                  </span>{" "}
                  Following
                </button>
              </div>
            </div>

            {/* ---------- EDIT PROFILE ---------- */}
            <div className="w-full md:w-auto">
              {isOwnProfile ? (
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full md:w-auto bg-primary text-white px-5 py-2 rounded-xl"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className="w-full md:w-auto bg-primary text-white px-5 py-2 rounded-xl"
                  onClick={handleFollow}
                >
                  {user?.isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {/* ---------- TABS ---------- */}
          <div className="mt-6 flex gap-6 border-b text-sm font-medium overflow-x-auto">
            <button className="pb-3 border-b-2 text-primary">Home</button>
            <button className="pb-3 text-gray-500 hover:text-primary">
              Most Liked
            </button>
            <button className="pb-3 text-gray-500 hover:text-primary">
              Oldest
            </button>
            {isOwnProfile && (
              <>
                <button className="pb-3 text-gray-500 hover:text-primary">
                  Saved
                </button>
                <button className="pb-3 text-gray-500 hover:text-primary">
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
              <UserPostCard key={post._id} post={post} />
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