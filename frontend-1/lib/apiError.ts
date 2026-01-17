// lib/apiError.ts
export const apiError = (error: any) => {
  if (!error?.response) {
    throw new Error("Server error. Try again.");
  }
  throw new Error(error?.response?.data?.detail || "Some thing went wrong");
};
