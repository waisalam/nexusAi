import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(100)
      .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    full_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const projectCreateSchema = z.object({
  github_repo_url: z
    .string()
    .min(1, "Repository URL is required")
    .regex(/github\.com/, "Must be a GitHub repository URL"),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProjectCreateFormData = z.infer<typeof projectCreateSchema>;
