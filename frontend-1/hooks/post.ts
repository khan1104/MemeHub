// hooks/usePost.ts
import { useState } from "react"
import { uploadPostSchema } from "@/schemas/post.schema"
import { handlePostUpload,
  getPosts,
  getSinglePost, 
  getCurrentUserPost,
handlePostLike,
handlePostDislike,
handlePostReport, 
handleGetUserPosts} from "@/services/post.service"
import { Post } from "@/types/posts.type"

export const usePost = () => {
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

  const fetchPosts = async (): Promise<Post[] | null> => {
    setError(null)
    try {
      setLoading(true)
      const posts = await getPosts()
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts=async(user_id:string)=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await handleGetUserPosts(user_id)
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
      const posts = await getSinglePost(post_id)
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUserPosts=async()=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await getCurrentUserPost()
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const like = async (post_id:string) => {
      setError(null);
      try {
        setLoading(true);
        await handlePostLike(post_id);
  
  
      } catch (err: any) {
        setError(err.message || "Action failed");
  
      } finally {
        setLoading(false);
      }
    };
    const dislike = async (post_id:string) => {
      setError(null);
      try {
        setLoading(true);
        await handlePostDislike(post_id);
  
  
      } catch (err: any) {
        setError(err.message || "Action failed");
  
      } finally {
        setLoading(false);
      }
    };
    const report = async (post_id:string) => {
      setError(null);
      try {
        setLoading(true);
        await handlePostReport(post_id);
  
  
      } catch (err: any) {
        setError(err.message || "Action failed");
  
      } finally {
        setLoading(false);
      }
    };


  return { uploadPost,fetchPosts,fetchUserPosts,fetchSinglePost,fetchCurrentUserPosts,like,dislike,report ,loading, error,setError }
}
