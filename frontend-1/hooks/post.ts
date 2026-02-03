// hooks/usePost.ts
import { useState } from "react"
import { uploadPostSchema } from "@/schemas/post.schema"
import { handlePostUpload,
  getPosts,
  getSinglePost,  
  handleGetUserPosts,
  handleDeletePost} from "@/services/post.service"
import { Post,PaginatedPostResponse } from "@/types/posts.type"
import { useUser } from "@/context/UserContext"
import { useFeed } from "@/context/FeedContext"

export const usePost = () => {
  const {user}=useUser()
  const {feed}=useFeed()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPost = async (
    caption: string,
    file: File,
    tags: string[]
  ) => {
    setError(null)

    const validation = uploadPostSchema.safeParse({
      caption,
      file,
      tags,
    })

    if (!validation.success) {
      setError(validation.error.issues[0].message)
      return false
    }

    const formData = new FormData()
    formData.append("caption", caption)
    formData.append("file", file)
    tags.forEach((tag) => formData.append("tags", tag))

    try {
      setLoading(true)
      await handlePostUpload(formData)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (cursor?: string): Promise<PaginatedPostResponse | null> => {
    setError(null)
    try {
      setLoading(true)
      const posts = await getPosts(feed,cursor,user?._id)
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts=async(user_id:string,sort_by?:string,cursor?: string):Promise<PaginatedPostResponse|null>=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await handleGetUserPosts(user_id,sort_by,cursor)
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }
  const fetchSinglePost = async (post_id:string): Promise<Post|null> => {
    setError(null)
    try {
      setLoading(true)
      const posts = await getSinglePost(post_id,user?._id)
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

    const deletePost = async (post_id:string)=> {
    setError(null)
    try {
      setLoading(true)
      await handleDeletePost(post_id)
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { uploadPost,fetchPosts,fetchUserPosts,fetchSinglePost,deletePost,loading, error,setError }
}
