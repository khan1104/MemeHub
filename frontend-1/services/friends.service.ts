import { protected_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"




export const handleSendRequest=async(user_id:string)=>{
    try{
        const res=await protected_api.post(`/friends/request/${user_id}`,{
            params: {
            user_id
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleFriendRequest=async(request_id:string,action:string)=>{
    try{
        const res=await protected_api.put(`/friends/request/${request_id}`,{
            params: {
            action
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleCancelRequest=async(user_id:string)=>{
    try{
        const res=await protected_api.delete(`/friends/requests/${user_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleRemovefriend=async(user_id:string)=>{
    try{
        const res=await protected_api.delete(`/friends/friends/${user_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleGetFriends=async(user_id:string,sort_by?:string,cursor?: string,limit: number = 12)=>{
    try{
        const res=await protected_api.get(`/friends/friends/${user_id}`,{
            params: {
            user_id,
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


export const handleGetMutualFriends=async(user_id:string,cursor?: string,limit: number = 12)=>{
    try{
        const res=await protected_api.get(`/friends/mutual-friends/${user_id}`,{
            params: {
            user_id,
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

export const handleGetRequests=async(cursor?: string,limit: number = 12)=>{
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

export const handleGetSentRequests=async(cursor?: string,limit: number = 12)=>{
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

