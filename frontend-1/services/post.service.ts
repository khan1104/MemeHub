import { protected_api, public_api } from "@/lib/api"
import { apiError } from "@/lib/apiError"


export const handlePostUpload = async (formData: FormData) => {
  try {
    const res = await protected_api.post("/posts/", formData)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const getPosts = async (
  sort_by?:string,
  cursor?: string,
  user_id?:string,
  limit: number = 10
) => {
  try{
  const res = await public_api.get("/posts/", {
    params: {
      sort_by,
      cursor,
      limit,
      user_id
    }
  })

  return res.data
}
catch (error: any) {
  apiError(error)
  }
}


export const getSinglePost=async(post_id:string,user_id?:string)=>{
  try{
    const res=await public_api.get(`/posts/${post_id}`,{
    params: {
      user_id
    }
  });
    return res.data
  }
  catch (error: any) {
  apiError(error)
  }
}

export const handleGetUserPosts=async(
  user_id:string,
  sort_by?:string,
  cursor?: string,
  limit: number = 9)=>{
  try{
    const res=await public_api.get(`/posts/user/${user_id}`,{
      params: {
      sort_by,
      cursor,
      limit
    }
    });
    return res.data
  }
  catch (error: any) {
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