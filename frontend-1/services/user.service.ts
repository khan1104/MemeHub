
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

export const handleGetUserById=async(user_id:string)=>{
  try {
    const res = await public_api.get(`/users/${user_id}`);
    return res.data;
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

export const handleReport=async(user_id:string)=>{
   try {
    const res = await protected_api.post(`/users/report/${user_id}`)
    return res.data
  } catch (error: any) {
    apiError(error)
  }
}


