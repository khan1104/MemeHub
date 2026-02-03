import { useState } from "react"
import { 
    handleCommentEdit,
    handleCommentDelete,
    handleCommentLike,
    handleCommentDislike,
    handleCommentReport

 } from "@/services/commentsAction.service";


export const useCommentAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const updateComment=async(comment_id:string,updatedComment:string)=>{
    setError(null)
    try {
      setLoading(true)
      await handleCommentEdit(comment_id,updatedComment);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteComment=async(comment_id:string)=>{
    setError(null)
    try {
      setLoading(true)
      await handleCommentDelete(comment_id);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const like=async(comment_id:string)=>{
    setError(null)
    try {
      setLoading(true)
      await handleCommentLike(comment_id);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

   const dislike = async (comment_id:string) => {
        setError(null);
        try {
        setLoading(true);
        await handleCommentDislike(comment_id);
        } catch (err: any) {
        setError(err.message || "Action failed");

        } finally {
        setLoading(false);
        }
    };
   const reportComment = async (comment_id:string,reason:string,description:string) => {
      setError(null);
      try {
        setLoading(true);
        await handleCommentReport(comment_id,reason,description);
      } catch (err: any) {
        setError(err.message || "Action failed");
  
      } finally {
        setLoading(false);
      }
    };

  return {updateComment,deleteComment,like,dislike,reportComment,loading, error,setError};
};
