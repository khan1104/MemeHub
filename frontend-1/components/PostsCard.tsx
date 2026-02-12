"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Flag,
  Link2
} from "lucide-react"
import { Post } from "@/types/posts.type"
import { useRouter } from "next/navigation"
import { usePostAction } from "@/hooks/postsAction"
import { useUser } from "@/context/UserContext"
import ReportModal from "@/components/modals/ReportModal";
import { formatCount } from "@/lib/formatCount"
import { timeAgo } from "@/lib/timeAgo"
import LoginRequiredModal from "./modals/LoginRequiredModal"

interface PostCardProps {
  post: Post
}

export default function PostCard({ post}: PostCardProps) {
  const router = useRouter()
  const { like, dislike,save, loading, error } = usePostAction();
  const { user: currentUser,isLoggedIn } = useUser()
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [likeCount, setLikeCount] = useState(post.like_count)
  const [dislikeCount, setDislikeCount] = useState(post.dislike_count)

  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [isDisliked, setIsDisliked] = useState(post.is_disliked)

  const [animateLike, setAnimateLike] = useState(false)
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwnProfile = currentUser?._id === post.created_by._id

  const [isModalOpen, setIsModalOpen] = useState(false);

  /** close menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ================= LIKE =================
  const checkAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  // ================= LIKE =================
  const handleLike = async () => {
    checkAuth(async () => {
      if (loading) return;

      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 250);

      // optimistic UI
      if (isLiked) {
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
      } else {
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
        if (isDisliked) {
          setDislikeCount((prev) => prev - 1);
          setIsDisliked(false);
        }
      }
      await like(post._id);
    });
  };

  // ================= DISLIKE =================
  const handleDislike = async () => {
    checkAuth(async () => {
      if (loading) return;

      if (isDisliked) {
        setDislikeCount((prev) => prev - 1);
        setIsDisliked(false);
      } else {
        setDislikeCount((prev) => prev + 1);
        setIsDisliked(true);
        if (isLiked) {
          setLikeCount((prev) => prev - 1);
          setIsLiked(false);
        }
      }
      await dislike(post._id);
    });
  };

  // ================= SAVE / BOOKMARK =================
  const handleSave = async () => {
    checkAuth(async () => {
      if (loading) return;

      setIsSaved((prev) => !prev); // optimistic
      await save(post._id);
    });
  };

  // ================= REPORT =================
  const handleReportClick =() => {
    checkAuth(() => {
      setIsModalOpen(true);
      setMenuOpen(false);
    });
  };

  // handleUserProfile function (already done by you)
  const handleUserProfile = () => {
      router.push(`/profile/${post.created_by._id}`);
  };
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl mb-4 shadow-sm">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* user info */}
        <LoginRequiredModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        <div
          onClick={handleUserProfile}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="relative h-10 w-10">
            <Image
              src={post.created_by.profile_pic}
              alt="profile"
              fill
              className="rounded-full object-cover border"
            />
          </div>

          <div>
            <p className="text-sm font-semibold hover:underline">
              {post.created_by.user_name}
            </p>
            <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
          </div>
        </div>

        {/* right actions */}
        {!isOwnProfile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-44 bg-white  rounded-b-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/posts/${post._id}`,
                    );
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 text-sm"
                >
                  <Link2 size={16} />
                  Copy link
                </button>

                <button
                  onClick={handleReportClick}
                  className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 text-sm"
                >
                  <Flag size={16} />
                  Report
                </button>
              </div>
            )}
            <ReportModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              targetType="Post"
              id={post._id}
            />
          </div>
        )}
      </div>

      {/* ================= CAPTION ================= */}
      <div className="px-4 pb-3">
        <p className="font-semibold text-gray-800 break-words">
          {post.caption}
        </p>
      </div>

      {/* ================= MEDIA ================= */}
      <div className="bg-black/5 flex justify-center">
        {post.media_type === "image" && (
          <Image
            src={post.media_url}
            alt="post"
            width={900}
            height={600}
            className="w-full max-h-130 object-contain"
          />
        )}

        {post.media_type === "video" && (
          // <CustomVideoPlayer
          //   src={post.media_url}
          //   className="w-full max-h-[520px]"
          // />
          <video
            src={post.media_url}
            controls
            playsInline
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="w-full max-h-130 object-contain"
          />
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex gap-1">
          {/* like */}
          <button
            disabled={loading}
            onClick={handleLike}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition hover:bg-gray-100
              ${isLiked ? "text-purple-600" : ""}

              ${animateLike ? "scale-125" : "scale-100"}
            `}
          >
            <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-bold">{formatCount(likeCount)}</span>
          </button>

          {/* dislike */}
          <button
            disabled={loading}
            onClick={handleDislike}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition hover:bg-gray-100 
              ${isDisliked ? "text-gray-650" : ""}`}
          >
            <ThumbsDown size={20} fill={isDisliked ? "currentColor" : "none"} />
            <span className="text-xs font-bold">
              {formatCount(dislikeCount)}
            </span>
          </button>

          {/* comment */}
          <button
            onClick={() => router.push(`/posts/${post._id}`)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-bold">Comment</span>
          </button>
        </div>

        <div className="flex gap-1">
          {/* bookmark */}
          <button
            onClick={handleSave}
            className={`p-2 transition rounded-lg hover:bg-gray-100
            ${isSaved ? "text-purple-600 bg-purple-100" : "text-gray-600"}
          `}
          >
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* share */}
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
