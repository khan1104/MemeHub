import { useState } from "react"
import { handleGetFriends } from "@/services/friends.service";
import { PaginatedFriendResponse } from "@/types/friends.type";

export const useFriends = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const getFriends=async(user_id:string,sort_by?:string,cursor?: string): Promise<PaginatedFriendResponse | null>=>{
    setError(null)
    try {
      setLoading(true)
      return await handleGetFriends(user_id,sort_by,cursor);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }


  return {getFriends,loading, error,setError};
};
