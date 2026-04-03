"use client";
import React, { useEffect, useState, useRef} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReportModal from "./modals/ReportModal";
import LoginRequiredModal from "./modals/LoginRequiredModal";
import { Connection as ConnectionType} from "@/types/friends.type";


import {
  MoreVertical,
  Flag,
  UserPlus,
  UserMinus,
  UserX,
} from "lucide-react";

import { useAuth } from "@/hooks/auth";


interface ConnectionProps {
  user: ConnectionType;
  handleUnfriend: (user_id: string) => void;
  handleFollow: (user_id: string) => void;
  handleUnFollow: (user_id: string) => void;
}

export default function Connections({
  user,
  handleUnfriend,
  handleFollow,
  handleUnFollow,
}: ConnectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { checkAuth, showLoginModal, setShowLoginModal } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:shadow-sm transition relative">
      {/* Left Section */}

      <div
        className="flex items-center gap-3"
        onClick={() => {
          router.push(`/profile/${user.user_id}`);
        }}
      >
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
          <Image
            src={user.profile_pic || "/default.png"}
            alt={user.user_name}
            fill
            className="object-cover"
          />
        </div>

        <p className="text-sm sm:text-base md:text-lg font-medium text-gray-800">
          {user.user_name}
        </p>
      </div>

      {/* ✅ SAME MENU FOR ALL DEVICES */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-md z-50">
            {/* Report */}
            <button
              onClick={() => {
                checkAuth(() => {
                  setIsModalOpen(true);
                });
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Flag size={16} />
              Report
            </button>

            {/* Follow / Unfollow */}
            <button
              onClick={() => {
                checkAuth(() => {
                  if (user.isFollowing) {
                    handleUnFollow(user.user_id);
                  } else {
                    handleFollow(user.user_id);
                  }
                  setOpen(false);
                });
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-purple-100"
            >
              {user.isFollowing ? (
                <>
                  <UserMinus size={16} />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Follow
                </>
              )}
            </button>

            {/* Unfriend */}
            {user.isFriend && (
              <button
                onClick={() => {
                  handleUnfriend(user.user_id);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-purple-100"
              >
                <UserX size={16} />
                Unfriend
              </button>
            )}
          </div>
        )}
      </div>
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="User"
        id={user.user_id}
      />
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
