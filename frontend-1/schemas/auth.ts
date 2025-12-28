import { z } from "zod";

export const registerSchema = z.object({
    username:z.string().min(4,"user must be at least 4 characters").max(10,"username is not more than 10 characters"),
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number"),
})

export const loginSchema=z.object({
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number"),
})
