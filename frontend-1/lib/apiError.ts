// lib/apiError.ts

import { toast } from "sonner";

export const apiError = (error: any) => {
  if(error?.response?.status==429){
    toast.error("Too many attempts. Try again later.")
    throw new Error("To many attempts. Try again.");
  }
  if (!error?.response) {
    throw new Error("Server error. Try again.");
  }
  throw new Error(error?.response?.data?.detail || "Some thing went wrong");
};
