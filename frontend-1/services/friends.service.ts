import { protected_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"


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

