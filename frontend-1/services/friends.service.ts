import { protected_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"




export const sendFriendRequest=async(user_id:string)=>{
    try{
        const res=await protected_api.post(`/friends/request/${user_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleFriendRequest=async(request_id:string,action:string)=>{
    try{
        const res=await protected_api.put(`/friends/request/${request_id}`,{},{
            params: {
                action,
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const cancelSentRequest=async(user_id:string)=>{
    try{
        const res=await protected_api.delete(`/friends/requests/${user_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const removeFriend=async(user_id:string)=>{
    try{
        const res=await protected_api.delete(`/friends/friends/${user_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const fetchFriends=async(user_id:string,sort_by?:string,cursor?: string,limit: number = 12)=>{
    try{
        const res=await protected_api.get(`/friends/friends/${user_id}`,{
            params: {
            sort_by,
            cursor,
            limit
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}


export const fetchMutualFriends=async(user_id:string,cursor?: string,limit: number = 12)=>{
    try{
        const res=await protected_api.get(`/friends/mutual-friends/${user_id}`,{
            params: {
            cursor,
            limit
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const fetchReciveRequests=async(cursor?: string,limit: number = 12)=>{
    try{
        const res=await protected_api.get(`/friends/requests`,{
            params: {
            cursor,
            limit
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const fetchSentRequests=async(cursor?: string,limit: number = 12)=>{
    try{
        const res=await protected_api.get(`/friends/sent-requests`,{
            params: {
            cursor,
            limit
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

