import { z } from "zod";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB


export const upadateProfilePicSchema = z.object({
  file: z
    .instanceof(File, { message: "Please upload a file" })
    .superRefine((file, ctx) => {
      const isImage = IMAGE_TYPES.includes(file.type);

      // 1. Check if the file type is supported at all
      if (!isImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only .jpg, .png, .mp4, and .webm formats are supported",
        });
        return;
      }
      // 2. Validate Image Size
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Images must be less than 5MB",
        });
      }
    }),
});