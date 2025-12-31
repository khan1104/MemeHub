"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
} from "lucide-react"
import { Post } from "@/types/Posts";
import CustomVideoPlayer from "./CustomVideoPlayer";

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }:PostCardProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="w-full max-w-full overflow-hidden bg-gray-100 rounded-xl mb-4">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src={post.created_by.profile_pic}
            alt="user"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-semibold">{post.created_by.user_name}</p>
            <p className="text-gray-500 text-xs">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div ref={menuRef} className="flex items-center gap-3 relative">
          <button className="text-white px-4 py-1.5 text-sm font-medium rounded-full bg-primary hover:bg-primary/90">
            Follow
          </button>

          <button onClick={() => setOpenMenu((p) => !p)}>
            <MoreHorizontal size={18} className="text-gray-600 hover:text-black" />
          </button>

          {openMenu && (
            <div className="absolute right-0 top-8 w-36 rounded-xl bg-white shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  setOpenMenu(false)
                  alert("Reported 🚩")
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                🚩 Report
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-2">
        <h2 className="font-semibold text-gray-900 break-words">
          {post.caption}
        </h2>
      </div>
      <div className="px-4 pb-4 max-w-full">
        {post.media_type === "image" && (
          <Image
            src={post.media_url}
            alt="post"
            width={700}
            height={500}
            className="w-full max-w-full max-h-[500px] object-contain rounded-lg bg-gray-100"
          />
        )}

        {post.media_type === "video" && (
          <video
            src={post.media_url}
            controls
            className="w-full max-w-full max-h-[500px] rounded-lg bg-gray-100"
          />
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t">

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600">
            <ThumbsUp size={18} />
            <span className="text-sm">{post.like_count}</span>
          </button>

          <button className="flex items-center gap-1 text-gray-600 hover:text-red-500">
            <ThumbsDown size={18} />
            <span className="text-sm">{post.dislike_count}</span>
          </button>

          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500">
            <MessageCircle size={18} />
            <span className="text-sm">Comment</span>
          </button>
        </div>

        <button className="flex items-center gap-1 text-gray-600 hover:text-green-600">
          <Share2 size={18} />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </div>
  )
}
