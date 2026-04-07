"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Edit,
  Users,
  UserPlus,
  ChevronDown,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LoginRequiredModal from "./modals/LoginRequiredModal";
import { User } from "@/types/user.type";
import { useUsers } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { useFriends } from "@/hooks/friends";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
}: ProfileHeaderProps) {
  const router = useRouter();
  const { loadUser, isLoading: contextLoading } = useUser();
  const { checkAuth, showLoginModal, setShowLoginModal } = useAuth();

  const {
    updateProfilePic,
    followUser,
    loading: userLoading,
    error: userError,
  } = useUsers();
  const {
    sendRequest,
    cancelRequest,
    removeFriend,
    loading: friendLoading,
    error: friendError,
  } = useFriends();

  // --- Local States for Optimistic UI ---
  const [totalFriends, setTotalFriends] = useState(user.total_friends);
  const [totalFollowers, setTotalFollowers] = useState(user.total_followers);
  const [isFollowed, setIsFollowed] = useState(user.isFollowing);
  const [isRequestSent, setIsRequestSent] = useState(user.isRequestSent);
  const [isFriend, setIsFriend] = useState(user.isFriend);

  // Keep local state in sync if the user prop changes (e.g., on navigation)
  useEffect(() => {
    setIsFriend(user.isFriend);
    setIsFollowed(user.isFollowing);
    setIsRequestSent(user.isRequestSent);
    setTotalFollowers(user.total_followers);
    setTotalFriends(user.total_friends); // Sync friends count
  }, [user]);

  // --- Error Handling & Optimistic Reversal ---
  useEffect(() => {
    if (userError) {
      // Revert Follow State
      setIsFollowed(user.isFollowing);
      setTotalFollowers(user.total_followers);
      toast.error(userError || "Failed to update follow status");
    }
  }, [userError, user]);

useEffect(() => {
  if (friendError) {
    setIsFriend(user.isFriend);
    setIsRequestSent(user.isRequestSent);
    setTotalFriends(user.total_friends); // Revert count on error
    toast.error(friendError || "Action failed");
  }
}, [friendError, user]);

  // --- Handlers ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await updateProfilePic(file);
    if (res) await loadUser();
  };

  const handleUnfriend = async () => {
    if (friendLoading) return;

    // Optimistic Update
    setIsFriend(false);
    setTotalFriends((prev) => prev - 1); // Friends count kam karein

    const res = await removeFriend(user.user_id);
    if (res) {
      toast.success("Removed from friends");
    }
  };
  const handleFollow = () => {
    checkAuth(async () => {
      if (!user?.user_id || userLoading) return;

      // Optimistic Update
      const nextState = !isFollowed;
      setIsFollowed(nextState);
      setTotalFollowers((prev) => (nextState ? prev + 1 : prev - 1));

      await followUser(user.user_id);
    });
  };

  const handleFriendAction = (action: "send" | "cancel") => {
    checkAuth(async () => {
      if (!user?.user_id || friendLoading) return;

      // Optimistic Update
      setIsRequestSent(action === "send");

      if (action === "send") await sendRequest(user.user_id);
      else await cancelRequest(user.user_id);
    });
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const actionBtnClass =
  "flex items-center justify-center gap-2 px-5 py-2 rounded-xl transition-all disabled:opacity-70";

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
                disabled={userLoading}
              >
                <Edit size={14} />
              </button>
              {userLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                </div>
              )}
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

                <button className="flex items-center gap-2 hover:text-purple-600">
                  <Users size={16} />
                  <span className="font-semibold">{totalFriends}</span>
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
                    {isFriend ? (
                      <>
                        <button
                          onClick={handleUnfriend}
                          disabled={friendLoading}
                          className={`${actionBtnClass} bg-gray-100 text-red-500 hover:bg-red-50`}
                        >
                          {friendLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            "Unfriend"
                          )}
                        </button>
                      </>
                    ) : isRequestSent ? (
                      <button
                        onClick={() => handleFriendAction("cancel")}
                        disabled={friendLoading}
                        className={`${actionBtnClass} bg-red-50 text-red-600 border border-red-100`}
                      >
                        {friendLoading && (
                          <Loader2 size={18} className="animate-spin" />
                        )}
                        Cancel Request
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFriendAction("send")}
                        disabled={friendLoading}
                        className={`${actionBtnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}
                      >
                        {friendLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <FaUserPlus size={18} />
                        )}
                        Add Friend
                      </button>
                    )}

                    <button
                      onClick={handleFollow}
                      disabled={userLoading}
                      className={`${actionBtnClass} ${isFollowed ? "bg-gray-800 text-white" : "bg-primary text-white"}`}
                    >
                      {userLoading && (
                        <Loader2 size={18} className="animate-spin" />
                      )}
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

              <button className="flex items-center gap-2 hover:text-purple-600">
                <Users size={16} />
                <span className="font-semibold">{totalFriends}</span>
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
              {isFriend? (
                <>
                  <button
                    onClick={handleUnfriend}
                    disabled={friendLoading}
                    className="bg-red-50 text-red-600 px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    {friendLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Unfriend"
                    )}
                  </button>
                </>
              ) : isRequestSent ? (
                <button
                  onClick={() => handleFriendAction("cancel")}
                  disabled={friendLoading}
                  className={`${actionBtnClass} bg-red-50 text-red-600 border border-red-100`}
                >
                  {friendLoading && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  Cancel Request
                </button>
              ) : (
                <button
                  onClick={() => handleFriendAction("send")}
                  disabled={friendLoading}
                  className={`${actionBtnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}
                >
                  {friendLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FaUserPlus size={18} />
                  )}
                  Add Friend
                </button>
              )}

              <button
                onClick={handleFollow}
                disabled={userLoading}
                className={`${actionBtnClass} ${isFollowed ? "bg-gray-800 text-white" : "bg-primary text-white"}`}
              >
                {userLoading && <Loader2 size={18} className="animate-spin" />}
                {isFollowed ? "Unfollow" : "Follow"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
