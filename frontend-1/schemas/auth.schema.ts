import { z } from "zod";

export const registerSchema = z.object({
    user_name:z.string().min(4,"user must be at least 4 characters").max(10,"username is not more than 10 characters"),
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 8 characters")
        .max(12, "Password should not greater than 15 characters")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain one special character")
})

export type RegisterInput=z.infer<typeof registerSchema>

export const loginSchema=z.object({
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number"),
})

export type LoginInput = z.infer<typeof loginSchema>
