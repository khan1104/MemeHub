import { useState } from "react"
import { upadateProfilePicSchema } from "@/schemas/user.schema";
import {handleFollow, handleGetUserById, handleReport, handleUpadteProfilePic, handleUpadteUserInfo} from "@/services/user.service";
import { useUser } from "@/context/UserContext";

export const useUsers = () => {
  const {user}=useUser()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserById=async(user_id:string)=>{
    setError(null);
    try{
      setLoading(true)
      const data=await handleGetUserById(user_id,user?._id);
      return data;
    }
    catch(error:any){
      setError(error.message)
      return null
    }finally {
      setLoading(false)
    }
  }

    const updateUserInfo=async(user_name?:string,bio?:string)=>{
      setError(null)
      try{
          setLoading(true)
          await handleUpadteUserInfo(user_name,bio);
          return true
      }
      catch(error:any){
        setError(error.message)
        return null
      }finally {
        setLoading(false)
      }
    }


  const updateProfilePic=async(file: File,)=>{
    setError(null)
    const validation = upadateProfilePicSchema.safeParse({file});

    if (!validation.success) {
        setError(validation.error.issues[0].message)
        return false
    }

    const formData = new FormData()
    formData.append("profile_pic", file)
    try{
        setLoading(true)
        await handleUpadteProfilePic(formData);
        return true
    }
    catch(error:any){
      setError(error.message)
      return null
    }finally {
      setLoading(false)
    }
  }

  const FollowUser=async(user_id:string)=>{
    try{
        setLoading(true)
        await handleFollow(user_id);
        return true
    }
    catch(error:any){
      setError(error.message)
      return null
    }finally {
      setLoading(false)
    }
  }
    const ReportUser=async(user_id:string,reason:string,description:string)=>{
    try{
        setLoading(true)
        await handleReport(user_id,reason,description);
        return true
    }
    catch(error:any){
      setError(error.message)
      return null
    }finally {
      setLoading(false)
    }
  }


  

  return {getUserById,updateUserInfo, updateProfilePic,FollowUser,ReportUser, loading, error, setError };
};

