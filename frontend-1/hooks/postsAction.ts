import { useState } from "react"
import { handlePostLike,
  handlePostDislike,
  handleGetLikedPosts,
  handleGetSavedPosts,
  handlePostsSave,
  handlePostReport,
handleGetComments,
handleAddComment } from "@/services/postAction.service";
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
      const posts = await handlePostsSave(post_id);
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedPosts=async()=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await handleGetSavedPosts();
      return posts
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedPosts=async()=>{
    setError(null)
    try {
      setLoading(true)
      const posts = await handleGetLikedPosts();
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
    const postReport = async (post_id:string,reason:string,description:string) => {
      setError(null);
      try {
        setLoading(true);
        await handlePostReport(post_id,reason,description);
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
        await handleAddComment(post_id,comment);
        return true;
      }
      catch(err:any){
        setError(err.message || "Action failed");
      }
      finally {
        setLoading(false);
      }
    }

    const getComments = async (post_id:string,sort_by:string,cursor?:string): Promise<PaginatedCommentResponse | null> => {
      setError(null)
      try {
        setLoading(true)
        const comments = await handleGetComments(post_id,cursor,user?._id,sort_by)
        return comments
      } catch (err: any) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    }
  return {save,fetchSavedPosts, fetchLikedPosts,like,dislike,postReport,addComment,getComments,loading, error,setError};
};
