import { protected_api, public_api } from "@/lib/api"
import { apiError } from "@/lib/apiError"


export const uploadPost = async (formData: FormData) => {
  try {
    const res = await protected_api.post("/posts/", formData)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const fetchPosts = async (
  sort_by?:string,
  cursor?: string|null,
  limit: number = 10
) => {
  try{
  const res = await protected_api.get("/posts/", {
    params: {
      sort_by,
      cursor,
      limit
    }
  })

  return res.data
}
catch (error: any) {
  apiError(error)
  }
}


export const fetchSinglePost=async(post_id:string,user_id?:string)=>{
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

export const fetchUserPosts=async(
  user_id:string,
  sort_by?:string,
  cursor?: string|null,
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

export const deletePost=async(post_id:string)=>{
  try{
    const res=await protected_api.delete(`/posts/${post_id}`);
    return res.data
  }
  catch (error: any) {
  apiError(error)
  }
}
