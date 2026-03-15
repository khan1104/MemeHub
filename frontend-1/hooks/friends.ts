import { useState } from "react"
import { handleGetFriends,
        handleGetMutualFriends,
        handleGetRequests,
        handleGetSentRequests,
        handleFriendRequest,
        handleCancelRequest,
        handleRemovefriend,
        handleSendRequest
 } from "@/services/friends.service";
import { PaginatedFriendResponse,PaginatedRequestResponse } from "@/types/friends.type";

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

  const getMutualFriends=async(user_id:string,cursor?: string): Promise<PaginatedFriendResponse | null>=>{
    setError(null)
    try {
      setLoading(true)
      return await handleGetMutualFriends(user_id,cursor);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getRequests=async(cursor?: string): Promise<PaginatedRequestResponse | null>=>{
    setError(null)
    try {
      setLoading(true)
      return await handleGetRequests(cursor);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getSentRequests=async(cursor?: string): Promise<PaginatedRequestResponse | null>=>{
    setError(null)
    try {
      setLoading(true)
      return await handleGetSentRequests(cursor);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }


  return {getFriends,getMutualFriends,getRequests,getSentRequests,loading, error,setError};
};
