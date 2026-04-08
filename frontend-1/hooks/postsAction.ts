import { useState } from "react"
import { 
  likePost,
  dislikePost,
  fetchLikedPosts,
  fetchSavedPosts,
  savePost,
  reportPost as reportPostService,
  fetchComments,
  addComment as addCommentService
 } from "@/services/postAction.service";
import { PaginatedCommentResponse } from "@/types/comments.type";
import { useUser } from "@/context/UserContext";


export const usePostAction = () => {
  const {user}=useUser()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const save=async(post_id:string)=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await savePost(post_id);
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getSavedPosts=async(cursor?: string|null)=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await fetchSavedPosts(cursor);
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getLikedPosts=async(cursor?: string|null)=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await fetchLikedPosts(cursor);
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
        await likePost(post_id);
  
  
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
        await dislikePost(post_id);
  
  
      } catch (err: any) {
        setError(err.message || "Action failed");
  
      } finally {
        setLoading(false);
      }
    };
    const reportPost = async (post_id:string,reason:string,description:string) => {
      setError(null);
      try {
        setLoading(true);
        await reportPostService(post_id,reason,description);
      } catch (err: any) {
        setError(err.message || "Action failed");
  
      } finally {
        setLoading(false);
      }
    };

    const addComment=async(post_id:string,comment:string)=>{
      setError(null);
      try{
        setLoading(true);
        await addCommentService(post_id,comment);
        return true;
      }
      catch(err:any){
        setError(err.message || "Action failed");
      }
      finally {
        setLoading(false);
      }
    }

    const getComments = async (post_id:string,sort_by:string,cursor?:string|null): Promise<PaginatedCommentResponse | null> => {
      setError(null)
      try {
        setLoading(true)
        const comments = await fetchComments(post_id,cursor,user?.user_id,sort_by)
        return comments
      } catch (err: any) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    }
  return {save,getSavedPosts, getLikedPosts,like,dislike,reportPost,addComment,getComments,loading, error,setError};
};
