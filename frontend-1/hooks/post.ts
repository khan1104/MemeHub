// hooks/usePost.ts
import { useState } from "react"
import { uploadPostSchema } from "@/schemas/post.schema"
import { uploadPost as uploadPostService,
  fetchPosts,
  fetchSinglePost,  
  fetchUserPosts,
  deletePost as deletePostService
} from "@/services/post.service"
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
      await uploadPostService(formData)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const getPosts = async (cursor?: string): Promise<PaginatedPostResponse | null> => {
    setError(null)
    try {
      setLoading(true)
      const posts = await fetchPosts(feed,cursor)
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUserPosts=async(user_id:string,sort_by?:string,cursor?: string):Promise<PaginatedPostResponse|null>=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await fetchUserPosts(user_id,sort_by,cursor)
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }
  const getSinglePost = async (post_id:string): Promise<Post|null> => {
    setError(null)
    try {
      setLoading(true)
      const posts = await fetchSinglePost(post_id,user?.user_id)
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
      await deletePostService(post_id)
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { uploadPost,getPosts,getUserPosts,getSinglePost,deletePost,loading, error,setError }
}
