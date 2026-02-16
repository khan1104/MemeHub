"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MoreVertical, Link2,Trash2 } from "lucide-react";
import { Post } from "@/types/posts.type";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { formatCount } from "@/lib/formatCount";
import { timeAgo } from "@/lib/timeAgo";
import { usePost } from "@/hooks/post";
import LoginRequiredModal from "./modals/LoginRequiredModal";


interface UserPostCardProps {
  post: Post;
  onDelete: (id: string) => void;
}

export default function UserPostCard({ post,onDelete }: UserPostCardProps) {
  const { user,isLoggedIn } = useUser();
  const router = useRouter();
  const {deletePost}=usePost()
  const isOwnPost = user?.user_id === post.created_by.user_id;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const checkAuth = (action: () => void) => {
      if (isLoggedIn) {
        action();
      } else {
        setShowLoginModal(true);
      }
  };

  const handleDeletePost = async (e:any) => {
      e.stopPropagation();
      checkAuth(async () => {
        setMenuOpen(false);

        // optimistic remove
        onDelete(post.post_id);

        await deletePost(post.post_id);
      });
    };


  return (
    <div
      onClick={() => router.push(`/posts/${post.post_id}`)}
      className="relative cursor-pointer rounded-xl overflow-hidden bg-gray-200 group border border-purple-200"
    >
      <LoginRequiredModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
      />
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
      <div className="p-3 flex justify-between items-center bg-white">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">
            {formatCount(post.like_count)} Likes
          </span>
          <span className="text-sm font-medium">•</span>
          <span className="text-sm text-gray-900">
            {timeAgo(post.created_at)}
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-2 bottom-2 w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1">
              <button
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/posts/${post.post_id}`,
                  );
                  setMenuOpen(false);
                }}
              >
                <Link2 size={14} />
                Copy link
              </button>

              {isOwnPost && (
                <button
                  className="w-full px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 text-sm"
                  onClick={handleDeletePost}
                >
                  <Trash2 size={14} />
                  Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
