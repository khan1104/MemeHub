"use client"

import { useState } from "react"

export default function CommentsSection({ postId, comments }) {
  const [text, setText] = useState("")
  const [allComments, setAllComments] = useState(comments)

  const handleComment = async () => {
    if (!text.trim()) return

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    )

    const newComment = await res.json()
    setAllComments([newComment, ...allComments])
    setText("")
  }

  return (
    <div className="bg-white rounded-xl p-4">
      <h3 className="font-semibold mb-4">
        Comments ({allComments.length})
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleComment}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Post
        </button>
      </div>

      <div className="space-y-3">
        {allComments.map(comment => (
          <div key={comment._id} className="text-sm">
            <span className="font-medium">
              {comment.user_name}
            </span>{" "}
            {comment.text}
          </div>
        ))}
      </div>
    </div>
  )
}
