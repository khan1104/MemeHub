import { z } from "zod"

export const uploadPostSchema = z.object({
  caption: z
    .string()
    .min(1, "Caption is required")
    .max(200, "Caption too long"),

  file: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "Max file size is 20MB"
    ),

  tags: z
    .array(z.string())
    .min(1, "Select at least one category")
    .max(3, "You can select max 3 categories"),
})

export type UploadPostInput = z.infer<typeof uploadPostSchema>
