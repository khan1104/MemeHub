import { protected_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"


export const handleCommentEdit=async(comment_id:string,updatedComment:string)=>{
    try{
        const res=await protected_api.patch(`/comments_actions/${comment_id}`,{
            comment:updatedComment
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleCommentDelete=async(comment_id:string)=>{
    try{
        const res=await protected_api.delete(`/comments_actions/${comment_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleCommentLike=async(comment_id:string)=>{
  try {
    const res = await protected_api.post(`/comments_actions/like/${comment_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleCommentDislike=async(comment_id:string)=>{
    try{
        const res=await protected_api.post(`/comments_actions/dislike/${comment_id}`)
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}

export const handleCommentReport=async(comment_id:string,reason:string,description:string)=>{
    try{
        const res=await protected_api.post(`/comments_actions/report/${comment_id}`,{
            reason:reason,
            description:description
        })
        return res.data
    }
    catch(error:any){
        apiError(error)
    }
}
