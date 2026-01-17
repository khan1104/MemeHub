import { useState } from "react"
import { handlePostDislike, handlePostLike, handlePostReport } from "@/services/PostsAction"


export const usePostAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  return { like,dislike,report,loading, error,setError };
};
