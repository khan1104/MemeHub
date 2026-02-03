"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { MdOutlineSort } from "react-icons/md";
import { Smile, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import PostCard from "@/components/PostsCard";
import RightSidebar from "@/components/layout/RightSidebar";
import Comments from "@/components/Comments";

import { formatCount } from "@/lib/formatCount";
import { usePost } from "@/hooks/post";
import { usePostAction } from "@/hooks/postsAction";
import { useUser } from "@/context/UserContext";

import { Post } from "@/types/posts.type";
import { Comment } from "@/types/comments.type";

export default function PostPage() {
  const { post_id } = useParams<{ post_id: string }>();

  const { fetchSinglePost, loading, error } = usePost();
  const { getComments, addComment,loading:commentLoading } = usePostAction();
  const { user } = useUser();

  // ---------------- STATE ----------------
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const totalComments=post?.total_comments
  const [sortBy, setSortBy] = useState<"latest" | "top">("latest");
  const [showSort, setShowSort] = useState(false);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ---------------- FETCH POST (ONLY ONCE) ----------------
  useEffect(() => {
    console.log("post load")
    if (!post_id) return;

    fetchSinglePost(post_id).then(setPost);
  }, [post_id]);

  // ---------------- FETCH COMMENTS ----------------
  const loadComments = useCallback(
    async (isInitial = false) => {
      if (commentLoading || (!hasNext && !isInitial)) return;

      const currentCursor = isInitial ? null : cursor;
      const data = await getComments(post_id, sortBy, currentCursor);

      if (!data) return;

      setComments((prev) =>
        isInitial ? data.items : [...prev, ...data.items],
      );

      setCursor(data.next_cursor);
      setHasNext(data.has_next);
    },
    [cursor, hasNext, sortBy, post_id, commentLoading,getComments],
  );

  // ---------------- SORT CHANGE RESET ----------------
  useEffect(() => {
    setComments([]);
    setCursor(null);
    setHasNext(true);
    loadComments(true);
  }, [sortBy]);

  // ---------------- INFINITE SCROLL ----------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !commentLoading) {
          loadComments();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadComments, hasNext, commentLoading]);

  // ---------------- ADD COMMENT ----------------
const handleAddComment = async () => {
  if (!commentText.trim() || !user) return;

  setCommentText("");

  // backend call
  const success = await addComment(post_id, commentText);
  if (!success) return;

  // update count immediately
  setPost((prev) =>
    prev ? { ...prev, total_comments: prev.total_comments + 1 } : prev,
  );

  // reset cursor BUT keep comments
  setCursor(null);
  setHasNext(true);

  // refetch fresh comments silently
  loadComments(true);
};

const handleDeleteLocal = (id: string) => {
  setComments((prev) => prev.filter((c) => c._id !== id));

  // ✅ decrease total comments
  setPost((prev) =>
    prev ? { ...prev, total_comments: prev.total_comments - 1 } : prev,
  );
};
  const handleUpdateLocal = (id: string, text: string) => {
    setComments((prev) =>
      prev.map((c) => (c._id === id ? { ...c, comment: text } : c)),
    );
  };

  // ---------------- UI STATES ----------------
  if (loading && !post)
    return <div className="text-center py-10">Loading post...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-10">Post not found</div>;

  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-6">
      {/* MAIN */}
      <main className="w-full max-w-170 mx-auto flex flex-col gap-3">
        <PostCard post={post} />

        {/* COMMENTS HEADER */}
        <div className="flex items-center gap-5 mt-2.5">
          <span className="font-medium">
            {formatCount(totalComments)} Comments
          </span>

          {/* SORT */}
          <div className="relative">
            <button
              onClick={() => setShowSort((p) => !p)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
            >
              <MdOutlineSort size={20} />
              Sort
            </button>

            {showSort && (
              <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-md z-10">
                {["latest", "top"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option as "latest" | "top");
                      setShowSort(false);
                    }}
                    className={`block w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                      sortBy === option ? "font-semibold" : ""
                    }`}
                  >
                    {option === "latest" ? "Latest" : "Top"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ADD COMMENT */}
        {user && (
          <div className="mt-4 flex gap-3 items-start">
            <div className="relative w-full">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border border-slate-300 rounded-xl px-4 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />

              <Smile
                size={20}
                onClick={() => setShowEmoji((p) => !p)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              />

              {showEmoji && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowEmoji(false)}
                  />
                  <div className="absolute bottom-14 left-0 z-50 shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        setCommentText((p) => p + emoji.emoji)
                      }
                      height={350}
                      width={300}
                      searchDisabled
                    />
                  </div>
                </>
              )}
            </div>

            <button
              disabled={!commentText.trim()}
              onClick={handleAddComment}
              className="bg-purple-600 text-white p-3 rounded-xl disabled:bg-slate-300"
            >
              <Send size={18} />
            </button>
          </div>
        )}

        {/* COMMENTS LIST */}
        {comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <Comments
                key={comment._id}
                comment={comment}
                onDelete={handleDeleteLocal}
                onUpdate={handleUpdateLocal}
              />
            ))}

            {/* SENTINEL */}
            <div
              ref={loaderRef}
              className="h-10 flex items-center justify-center"
            >
              {commentLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700" />
              )}
            </div>
          </>
        ) : (
          !commentLoading && (
            <div className="py-20 text-center text-gray-500 font-medium">
              No comments yet!
            </div>
          )
        )}
      </main>

      {/* SIDEBAR */}
      <aside className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-5 py-3 -mt-6">
          <RightSidebar />
        </div>
      </aside>
    </div>
  );
}
