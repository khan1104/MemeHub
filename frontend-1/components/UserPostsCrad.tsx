"use client";

import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { Post } from "@/types/posts.type";
import { useRouter } from "next/navigation";

interface UserPostCardProps {
  post: Post;
}

export default function UserPostCard({ post }: UserPostCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/posts/${post._id}`)}
      className="relative cursor-pointer rounded-xl overflow-hidden bg-gray-100 group"
    >
      {/* MEDIA */}
      {post.media_type === "image" && (
        <Image
          src={post.media_url}
          alt="post"
          width={400}
          height={400}
          className="w-full h-64 object-contain"
        />
      )}

      {post.media_type === "video" && (
        <video
          src={post.media_url}
          muted
          className="w-full h-64 object-contain"
        />
      )}

      {/* HOVER OVERLAY */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white">
        <div className="flex items-center gap-2">
          <Heart size={20} />
          <span className="font-semibold">{post.like_count}</span>
        </div>
      </div>
    </div>
  );
}
