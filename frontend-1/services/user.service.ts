
import { protected_api,public_api } from "@/lib/api";
import {apiError} from "@/lib/apiError";


export const handleGetCurrentUser= async () => {
  try {
    const res = await protected_api.get("/users/me");
    return res.data;
  } catch (error: any) {
    apiError(error)
  }
};

export const handleGetUserById=async(user_id:string,current_user_id:string)=>{
  try {
    const res = await protected_api.get(`/users/${user_id}`,
      {
        params: {
          current_user_id
    }
      }
    );
    return res.data;
  } catch (error: any) {
    apiError(error)
  }
}

export const handleUpadteUserInfo=async(user_name?:string,bio?:string)=>{
  try {
    const res = await protected_api.patch("/users/me/info",{
      user_name,
      bio
    })
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleUpadteProfilePic=async(formData: FormData)=>{
  try {
    const res = await protected_api.patch("/users/me/profile-pic", formData)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleFollow=async(user_id:string)=>{
  try {
    const res = await protected_api.post(`/users/follow/${user_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleReport=async(user_id:string,reason:string,description:string)=>{
   try {
    const res = await protected_api.post(`/users/report/${user_id}`,{
      reason:reason,
      description:description
    })
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}


export const handleGetFollowers=async(user_id:string,cursor?: string,limit: number = 12)=>{
   try {
  const res = await protected_api.get(`/users/followers/${user_id}`,{
      params: {
            cursor,
            limit
            }
      }
  )
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}

export const handleGetFollowings=async(user_id:string,cursor?: string,limit: number = 12)=>{
   try {
    const res = await protected_api.get(`/users/followings/${user_id}`,{
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

export const searchUsers = async (query: string) => {
  try {
    const res = await protected_api.get(`/users/search`, {
      params: { q: query },
    });
    return res.data;
  } catch (error: any) {
    apiError(error);
    return [];
  }
};


