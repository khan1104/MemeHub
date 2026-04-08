import { protected_api} from "@/lib/api"
import { apiError } from "@/lib/apiError"

export const savePost=async(post_id:string)=>{
  try {
    const res = await protected_api.post(`/posts_actions/save/${post_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}
export const fetchSavedPosts=async(cursor?: string|null,limit: number = 6)=>{
  try {
    const res = await protected_api.get(`/posts_actions/save`,{
    params: {
      cursor,
      limit
    }
  })
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const fetchLikedPosts=async(cursor?: string|null,limit: number =6)=>{
  try {
    const res = await protected_api.get(`/posts_actions/liked`,{
    params: {
      cursor,
      limit
    }
  })
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const likePost= async (post_id:string) => {
  try {
    const res = await protected_api.post(`/posts_actions/like/${post_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const dislikePost=async(post_id:string)=>{
  try {
    const res = await protected_api.post(`/posts_actions/dislike/${post_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const reportPost=async(post_id:string,reason:string,description:string)=>{
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

export const fetchComments=async(
  post_id:string,
  cursor?: string|null,
  user_id?:string,
  sort_by?:string,
  limit: number = 3
)=>{
  try{
    const res = await protected_api.get(`/posts_actions/comments/${post_id}`, {
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


export const addComment=async(post_id:string,comment:string)=>{
  try{
    const res = await protected_api.post(`/posts_actions/comment/${post_id}`, {comment:comment})
    return res.data
  }
  catch(error:any){
    apiError(error)
  }
}