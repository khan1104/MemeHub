"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  Edit,
  Users,
  UserPlus,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { User } from "@/types/user.type";

interface ProfileHeaderProps {
  user: User | null;
  isOwnProfile: boolean;
  onChangeProfilePic: (file: File) => Promise<void>;
  onFollow: () => Promise<void>;
  activeTab: string;
  setActiveTab: (
    tab: "latest" | "top" | "oldest" | "saved" | "liked",
  ) => void;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  onChangeProfilePic,
  onFollow,
  activeTab,
  setActiveTab,
}: ProfileHeaderProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const tabClass = (tab: string) =>
    `pb-2 border-b-2 cursor-pointer whitespace-nowrap transition ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-gray-500 hover:text-primary"
    }`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onChangeProfilePic(file);
  };

  return (
    <div className="sticky top-0 left-0 z-10 py-6 -mt-6 bg-white">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* ---------- USER INFO ---------- */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl font-semibold">
            {user?.user_name}
          </h1>

          {/* -------- MOBILE COLLAPSIBLE -------- */}
          <details className="md:hidden mt-1 group">
            <summary className="list-none cursor-pointer text-sm text-gray-500 flex items-center justify-center gap-1 ml-2">
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
                  <span className="font-semibold">{user?.total_friends}</span>
                  Friends
                </button>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() => router.push(`/profile/${user?.user_id}/followers`)}
                >
                  <UserPlus size={16} />
                  <span className="font-semibold">{user?.total_followers}</span>
                  Followers
                </button>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() => router.push(`/profile/${user?.user_id}/following`)}
                >
                  <UserPlus size={16} />
                  <span className="font-semibold">{user?.total_following}</span>
                  Following
                </button>
              </div>

              <div className="mt-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full bg-primary text-white px-5 py-2 rounded-xl"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {/* Message or Add Friend */}
                    {user?.isFriend ? (
                      <button className="flex-1 bg-gray-200 px-4 py-2 rounded-xl flex items-center justify-center gap-2">
                        <MessageCircle size={16} />
                        Message
                      </button>
                    ) : (
                      <button className="flex-1 bg-gray-200 px-4 py-2 rounded-xl flex items-center justify-center gap-2">
                        <FaUserPlus size={16} />
                        Add Friend
                      </button>
                    )}

                    {/* Follow Button */}
                    <button
                      onClick={onFollow}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-xl"
                    >
                      {user?.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* -------- DESKTOP INFO -------- */}
          <div className="hidden md:block">
            <p className="mt-1 text-sm text-gray-600">
              {user?.bio || "No bio available"}
            </p>

            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <div>
                <span className="font-semibold">{user?.total_posts}</span> Posts
              </div>

              <button className="flex items-center gap-2 hover:text-purple-600"
              onClick={()=>router.push(`/profile/${user?.user_id}/friends`)}>
                <Users size={16} />
                <span className="font-semibold">{user?.total_friends}</span>
                Friends
              </button>

              <button className="flex items-center gap-2 hover:text-purple-600">
                <UserPlus size={16} />
                <span className="font-semibold">{user?.total_followers}</span>
                Followers
              </button>

              <button className="flex items-center gap-2 hover:text-purple-600">
                <UserPlus size={16} />
                <span className="font-semibold">{user?.total_following}</span>
                Following
              </button>
            </div>
          </div>
        </div>

        {/* ---------- DESKTOP ACTION ---------- */}
        <div className="hidden md:flex gap-3">
          {isOwnProfile ? (
            <button
              onClick={() => router.push("/settings")}
              className="bg-primary text-white px-5 py-2 rounded-xl"
            >
              Edit Profile
            </button>
          ) : (
            <>
              {user?.isFriend && (
                <button className="bg-gray-200 px-5 py-2 rounded-xl flex items-center gap-2">
                  <MessageCircle size={16} />
                  Message
                </button>
              )}

              {!user?.isFriend && (
                <button className="bg-gray-200 px-5 py-2 rounded-xl flex items-center gap-2">
                  <FaUserPlus size={16} />
                  Add Friend
                </button>
              )}

              <button
                onClick={onFollow}
                className="bg-primary text-white px-5 py-2 rounded-xl"
              >
                {user?.isFollowing ? "Unfollow" : "Follow"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="mt-6 flex gap-4 border-b text-sm font-medium overflow-x-auto">
        <button
          className={tabClass("latest")}
          onClick={() => setActiveTab("latest")}
        >
          New
        </button>
        <button className={tabClass("top")} onClick={() => setActiveTab("top")}>
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
  );
}
