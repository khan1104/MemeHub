import { protected_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"


export const handleGetFriends=async(user_id:string,current_user_id?:string)=>{
    try{
        const res=await protected_api.get(`/friends/friends/${user_id}`,{
            params: {
            user_id,
            current_user_id
            }
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

