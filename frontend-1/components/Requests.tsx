"use client";
import React from "react";
import Image from "next/image";
import { Request as requestData } from "@/types/friends.type";

import { FaCheck } from "react-icons/fa6";

import { X } from "lucide-react";

type Purpose = "Recived" | "Sent";
interface RequestsProps {
  request: requestData;
  purpose: Purpose;
  handleFriendRequest: (
    request_id: string,
    action: "accepted" | "rejected",
  ) => void;
  handleCancelRequest: (user_id: string) => void;
}

export default function Request({
  request,
  purpose,
  handleFriendRequest,
  handleCancelRequest,
}: RequestsProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:shadow-sm transition">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
          <Image
            src={request.profile_pic || "/default.png"}
            alt={request.user_name}
            fill
            className="object-cover"
          />
        </div>

        <p className="text-sm sm:text-base md:text-lg font-medium text-gray-800">
          {request.user_name}
        </p>
      </div>

      {/* RIGHT SECTION */}
      {purpose === "Recived" ? (
        <>
          {/* ✅ MOBILE */}
          <div className="flex gap-2 sm:hidden">
            <button
              className="px-4 py-1 text-sm rounded-2xl bg-primary text-white"
              onClick={() => handleFriendRequest(request.id, "accepted")}
            >
              Accept
            </button>

            <button
              className="px-4 py-1 text-sm rounded-2xl bg-gray-200"
              onClick={() => handleFriendRequest(request.id, "rejected")}
            >
              Reject
            </button>
          </div>

          {/* ✅ DESKTOP */}
          <div className="hidden sm:flex gap-2">
            <button
              className="p-2 rounded-full bg-primary text-white hover:scale-105 transition"
              onClick={() => handleFriendRequest(request.id, "accepted")}
            >
              <FaCheck size={18} />
            </button>

            <button
              className="p-2 rounded-full bg-gray-200 hover:scale-105 transition"
              onClick={() => handleFriendRequest(request.id, "rejected")}
            >
              <X size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ✅ MOBILE */}
          <div className="flex sm:hidden">
            <button
              className="px-4 py-1 text-md rounded-md bg-gray-200"
              onClick={() => {
                handleCancelRequest(request.user_id);
              }}
            >
              Cancel
            </button>
          </div>

          {/* ✅ DESKTOP */}
          <div className="hidden sm:block">
            <button
              className="px-4 py-1 text-md rounded-md bg-gray-200"
              onClick={() => {
                handleCancelRequest(request.user_id);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
