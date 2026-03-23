"use client";

import React, { useRef, useState } from "react";
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
import LoginRequiredModal from "../modals/LoginRequiredModal";
import { User } from "@/types/user.type";
import { useUsers } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { useFriends } from "@/hooks/friends";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
}: ProfileHeaderProps) {
  const router = useRouter();

  const { isLoggedIn, loadUser ,isLoading} = useUser();
  const {
    updateProfilePic,
    followUser
  } = useUsers();
  const {
    sendRequest,
    cancelRequest
  } = useFriends();

  
  const [totalFollowers,setTotalFollowers]=useState(user.total_followers)

  const [isFollowed, setIsFollowed] = useState(user.isFollowing);
  const [isRequestSent, setIsRequestSent] = useState(user.isRequestSent);

  const [showLoginModal, setShowLoginModal] = useState(false);


  const fileRef = useRef<HTMLInputElement>(null);

  const checkAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await updateProfilePic(file);
    if (res) {
      await loadUser();
    }
  };


  const handleFollow = async () => {
    checkAuth(async () => {
      if (!user?.user_id || isLoading) return;
      // optimistic UI
      if (isFollowed) {
        setTotalFollowers((prev) => prev - 1);
        setIsFollowed(false);
      } else {
        setTotalFollowers((prev) => prev + 1);
        setIsFollowed(true);
      }
      await followUser(user.user_id);
    });
  };

  const handleAddFriend = async () => {
    checkAuth(async () => {
      if (!user?.user_id || isLoading) return;
      if (isRequestSent) {
        setIsRequestSent(false);
      } else {
        setIsRequestSent(true);
      }
      await sendRequest(user.user_id);
    });
  };
  const handleCancelRequest = async () => {
    checkAuth(async () => {
      if (!user?.user_id || isLoading) return;
      if (isRequestSent) {
        setIsRequestSent(false);
      } else {
        setIsRequestSent(true);
      }
      await cancelRequest(user.user_id);
    });
  };

  return (
    <div className="sticky top-0 left-0 z-10 py-6 -mt-6 bg-white">
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
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
                  <span className="font-semibold">{user?.total_posts}</span> Posts
                </div>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() =>
                    router.push(`/profile/${user?.user_id}/connections`)
                  }
                >
                  <Users size={16} />
                  <span className="font-semibold">{user?.total_friends}</span>
                  Friends
                </button>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() =>
                    router.push(`/profile/${user?.user_id}/connections`)
                  }
                >
                  <UserPlus size={16} />
                  <span className="font-semibold">{totalFollowers}</span>
                  Followers
                </button>

                <button
                  className="flex items-center gap-2 hover:text-purple-600"
                  onClick={() =>
                    router.push(`/profile/${user?.user_id}/connections`)
                  }
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
                  <div className="grid grid-cols-2 gap-2">
                    {user?.isFriend && (
                      <button className="bg-gray-200 px-5 py-2 rounded-xl flex items-center gap-2">
                        <MessageCircle size={16} />
                        Message
                      </button>
                    )}
                    {isRequestSent ? (
                      <button
                        className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                        
                        onClick={handleCancelRequest}
                      >
                        Cancel Request
                      </button>
                    ) : (
                      <button
                        className="bg-gray-200 px-7 py-2 rounded-xl flex items-center gap-2"
                        onClick={handleAddFriend}
                        
                      >
                        <FaUserPlus size={16} />
                        Add Friend
                      </button>
                    )}

                    <button
                      onClick={handleFollow}
                      className="bg-primary text-white px-5 py-2 rounded-xl"
                     
                    >
                      {isFollowed ? "Unfollow" : "Follow"}
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

              <button
                className="flex items-center gap-2 hover:text-purple-600"
                onClick={() => router.push(`/profile/${user?.user_id}/friends`)}
              >
                <Users size={16} />
                <span className="font-semibold">{user?.total_friends}</span>
                Friends
              </button>

              <button className="flex items-center gap-2 hover:text-purple-600">
                <UserPlus size={16} />
                <span className="font-semibold">{totalFollowers}</span>
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
              {isRequestSent ? (
                <button
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                  onClick={handleCancelRequest}
                  
                >
                  Cancel Request
                </button>
              ) : (
                <button
                  className="bg-gray-200 px-7 py-2 rounded-xl flex items-center gap-2"
                  onClick={handleAddFriend}
                  
                >
                  <FaUserPlus size={16} />
                  Add Friend
                </button>
              )}

              <button
                onClick={handleFollow}
                className="bg-primary text-white px-5 py-2 rounded-xl"
                
              >
                {isFollowed ? "Unfollow" : "Follow"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

