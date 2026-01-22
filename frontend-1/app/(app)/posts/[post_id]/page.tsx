"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import PostCard from "@/components/PostsCard"
import { usePost } from "@/hooks/post"
import { Post } from "@/types/posts.type"
import RightSidebar from "@/components/layout/RightSidebar"
import { useUser } from "@/context/UserContext"

export default function PostPage() {
  const { post_id } = useParams<{ post_id: string }>()

  const { fetchSinglePost, loading, error } = usePost()
  const {user}=useUser()

  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
  if (!post_id || user === undefined) return
  // ⬆️ wait for auth hydration

  const loadPost = async () => {
    const data = await fetchSinglePost(post_id)
    setPost(data)
  }

  loadPost()
}, [post_id, user])

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!post) {
    return <div className="text-center">Post not found</div>
  }

  return (
    <div className="mx-auto flex max-w-360 gap-6 px-2 sm:px-5 lg:px-8 pt-6">
      <main className="w-full max-w-170 mx-auto flex flex-col gap-2">
        <PostCard post={post} />

        {/* 🔜 Comments will come later */}
      </main>

      <aside className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-5 py-3 -mt-6">
           <RightSidebar/>
        </div>
      </aside>
    </div>
  )
}
