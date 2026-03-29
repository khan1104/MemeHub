import { useState } from "react"
import { fetchFriends,
        fetchMutualFriends,
        fetchReciveRequests,
        fetchSentRequests,
        handleFriendRequest,
        cancelSentRequest,
        removeFriend,
        sendFriendRequest
 } from "@/services/friends.service";
import { PaginatedFriendResponse,PaginatedRequestResponse } from "@/types/friends.type";

export const useFriends = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const getFriends=async(user_id:string,sort_by?:string,cursor?: string): Promise<PaginatedFriendResponse | null>=>{
    setError(null)
    try {
      setLoading(true)
      return await fetchFriends(user_id,sort_by,cursor);
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
      return await fetchMutualFriends(user_id,cursor);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getReciveRequests=async(cursor?: string): Promise<PaginatedRequestResponse | null>=>{
    setError(null)
    try {
      setLoading(true)
      return await fetchReciveRequests(cursor);
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
      return await fetchSentRequests(cursor);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const sendRequest=async(user_id:string)=>{
    setError(null)
    try {
      setLoading(true)
      return await sendFriendRequest(user_id);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const cancelRequest=async(user_id:string)=>{
    setError(null)
    try {
      setLoading(true)
      return await cancelSentRequest(user_id);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleReciveRequest=async(request_id:string,action:string)=>{
    setError(null)
    try {
      setLoading(true)
      return await handleFriendRequest(request_id,action);
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  } 

  



  return {getFriends,getMutualFriends,getReciveRequests,getSentRequests,sendRequest,cancelRequest,handleReciveRequest,loading, error,setError};
};
