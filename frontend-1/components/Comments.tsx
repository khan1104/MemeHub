"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, MoreVertical, Flag } from "lucide-react";
import { MdDelete, MdEdit} from "react-icons/md";

import { Comment } from "@/types/comments.type";
import { useUser } from "@/context/UserContext";
import { timeAgo } from "@/lib/timeAgo";
import { formatCount } from "@/lib/formatCount";
import {useCommentAction} from "@/hooks/commentActions"
import ReportModal from "./modals/ReportModal";
import LoginRequiredModal from "./modals/LoginRequiredModal";

interface CommentProps {
  comment: Comment;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

function Comments({ comment, onDelete, onUpdate }: CommentProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {
    updateComment,
    deleteComment,
    like,
    dislike,
    loading,
    error,
  } = useCommentAction();

  const isOwnComment = user?.user_id === comment.created_by.user_id;

  // optimistic local state
  const [likes, setLikes] = useState(comment.like_count || 0);
  const [dislikes, setDislikes] = useState(comment.dislike_count || 0);
  const [liked, setLiked] = useState(comment.is_liked || false);
  const [disliked, setDisliked] = useState(comment.is_disliked || false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  console.log(comment)

  const checkAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };
  const handleLike = async () => {
    checkAuth(async () => {
      if (loading) return;
      if (liked) {
        setLikes((prev) => prev - 1);
        setLiked(false);
      } else {
        setLikes((prev) => prev + 1);
        setLiked(true);
        if (disliked) {
          setDislikes((p) => p - 1);
          setDisliked(false);
        }
      }
      await like(comment.comment_id);
    });
  };


  const handleDislike = async () => {
    checkAuth(async () => {
      if (loading) return;

      if (disliked) {
        setDislikes((prev) => prev - 1);
        setDisliked(false);
      } else {
        setDislikes((prev) => prev + 1);
        setDisliked(true);
        if (liked) {
          setLikes((prev) => prev - 1);
          setLiked(false);
        }
      }
      await dislike(comment.comment_id);
    });
  };
  const handleReportClick = () => {
    checkAuth(() => {
      setIsModalOpen(true);
      setMenuOpen(false);
    });
  };

  const handleDeleteComment = async () => {
    checkAuth(async () => {
      setMenuOpen(false);

      // optimistic remove
      onDelete(comment.comment_id);

      await deleteComment(comment.comment_id);
    });
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    // optimistic UI update
    onUpdate(comment.comment_id, editText);
    setIsEditing(false);

    await updateComment(comment.comment_id, editText);
  };

  return (
    <div className="relative flex gap-3 py-4 mt-2.5">
      {/* PROFILE */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <div
        className="relative h-9 w-9 shrink-0 cursor-pointer"
        onClick={() => router.push(`/profile/${comment.created_by.user_id}`)}
      >
        <Image
          src={comment.created_by.profile_pic}
          alt="profile"
          fill
          className="rounded-full object-cover border"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col w-full">
        {/* USERNAME + TIME */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className="font-medium cursor-pointer hover:underline"
            onClick={() => router.push(`/profile/${comment.created_by.user_id}`)}
          >
            {comment.created_by.user_name}
          </span>
          <span className="text-xs text-slate-500">
            · {timeAgo(comment.created_at)}
          </span>
        </div>

        {/* COMMENT TEXT */}
        {isEditing ? (
          <div className="mt-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-sm border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded-md"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setEditText(comment.comment);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-xs text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap break-words">
            {comment.comment}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-black ${
              liked ? "text-purple-600" : ""
            }`}
          >
            <ThumbsUp size={14} fill={liked ? "currentColor" : "none"} />
            {formatCount(likes)}
          </button>

          <button
            onClick={handleDislike}
            className={`flex items-center gap-1 hover:text-black ${
              disliked ? "text-gray-700" : ""
            }`}
          >
            <ThumbsDown size={14} fill={disliked ? "currentColor" : "none"} />
            {formatCount(dislikes)}
          </button>
        </div>
      </div>

      {/* MORE MENU */}
      <MoreVertical
        size={18}
        className="cursor-pointer text-slate-500 hover:text-black"
        onClick={() => setMenuOpen((p) => !p)}
      />
      {menuOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />

          {/* DROPDOWN */}
          <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
            {isOwnComment ? (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 text-sm"
                >
                  <MdEdit size={16} />
                  Edit
                </button>

                <button
                  onClick={handleDeleteComment}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 text-sm text-red-600"
                >
                  <MdDelete size={16} />
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleReportClick}
                className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 text-sm text-red-600"
              >
                <Flag size={16} />
                Report
              </button>
            )}
          </div>
        </>
      )}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="Comment"
        id={comment.comment_id}
      />
    </div>
  );
}

export default Comments;
