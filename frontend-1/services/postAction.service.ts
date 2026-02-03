import { protected_api,public_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"

export const handlePostsSave=async(post_id:string)=>{
  try {
    const res = await protected_api.post(`/posts_actions/save/${post_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}
export const handleGetSavedPosts=async()=>{
  try {
    const res = await protected_api.get(`/posts_actions/save`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleGetLikedPosts=async()=>{
  try {
    const res = await protected_api.get(`/posts_actions/liked`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handlePostLike= async (post_id:string) => {
  try {
    const res = await protected_api.post(`/posts_actions/like/${post_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handlePostDislike=async(post_id:string)=>{
  try {
    const res = await protected_api.post(`/posts_actions/dislike/${post_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handlePostReport=async(post_id:string,reason:string,description:string)=>{
 try {
    const res = await protected_api.post(`/posts_actions/report/${post_id}`,{
      reason:reason,
      description:description
    })
    console.log(res.data)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleGetComments=async(
  post_id:string,
  cursor?: string,
  user_id?:string,
  sort_by?:string,
  limit: number = 3
)=>{
  try{
    const res = await public_api.get(`/posts_actions/comments/${post_id}`, {
        params: {
          user_id,
          sort_by,
          cursor,
          limit,
        }
      })
    
      return res.data
  }
  catch(error:any){
    apiError(error)
  }
}


export const handleAddComment=async(post_id:string,comment:string)=>{
  try{
    const res = await protected_api.post(`/posts_actions/comment/${post_id}`, {comment:comment})
    return res.data
  }
  catch(error:any){
    apiError(error)
  }
}