"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react"
import { Post } from "@/types/posts.type";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { useRouter } from "next/navigation"
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const {like,dislike,report,loading,error}=usePost();
  const {FollowUser}=useUsers()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false) // State for bookmark toggle

  return (
    <div className="w-full max-w-full overflow-hidden bg-white border border-gray-200 rounded-xl mb-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3" onClick={()=>{router.push(`/profile/${post.created_by._id}`)}}>
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src={post.created_by.profile_pic}
              alt={post.created_by.user_name}
              fill
              className="rounded-full object-cover border border-gray-100"
            />
          </div>
          <div className="text-sm">
            <p className="text-gray-900 hover:underline cursor-pointer">
                {post.created_by.user_name}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button className="text-white px-5 py-2 text-xs font-bold rounded-full bg-primary hover:bg-blue-700 transition-colors"
          onClick={()=>FollowUser(post.created_by._id)}
          >
            Follow
          </button>
          <button className="text-white px-5 py-2 text-xs font-bold rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          onClick={()=>report(post._id)}
          >
            Report
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <h2 className="font-bold text-lg text-gray-800 leading-relaxed break-words">
          {post.caption}
        </h2>
      </div>

      {/* Media Content */}
      <div className="bg-black/5 flex justify-center items-center w-full">
        {post.media_type === "image" && (
          <div className="relative w-full">
            <Image
              src={post.media_url}
              alt="post content"
              width={800}
              height={600}
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>
        )}

        {post.media_type === "video" && (
          <CustomVideoPlayer src={post.media_url} className="w-full max-h-[500px]" />
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-1">
          {/* Like */}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all group"
          onClick={()=>like(post._id)}
          >
            <ThumbsUp size={20} className="group-active:scale-125 transition-transform" />
            <span className="text-xs font-bold">{post.like_count}</span>
          </button>

          {/* Dislike */}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all group"
          onClick={()=>dislike(post._id)}
          >
            <ThumbsDown size={20} className="group-active:scale-125 transition-transform" />
            <span className="text-xs font-bold">{post.dislike_count}</span>
          </button>

          {/* Comments */}
          <button 
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
            onClick={() => router.push(`/posts/${post._id}`)}
          >
            <MessageCircle size={20} />
            <span className="text-xs font-bold">Comment</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Save/Bookmark */}
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-lg transition-all ${isSaved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* Share */}
          <button className="p-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}