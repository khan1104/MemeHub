import { z } from "zod";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadPostSchema = z.object({
  caption: z
    .string()
    .trim() // Removes accidental whitespace
    .min(1, "Caption is required")
    .max(200, "Caption must be under 200 characters"),

  file: z
    .instanceof(File, { message: "Please upload a file" })
    .superRefine((file, ctx) => {
      const isImage = IMAGE_TYPES.includes(file.type);
      const isVideo = VIDEO_TYPES.includes(file.type);

      // 1. Check if the file type is supported at all
      if (!isImage && !isVideo) {
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

      // 3. Validate Video Size
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Videos must be less than 50MB",
        });
      }
    }),

  tags: z
    .array(z.string())
    .min(1, "Select at least one category")
    .max(3, "You can select a maximum of 3 categories"),
});

export type UploadPostInput = z.infer<typeof uploadPostSchema>;