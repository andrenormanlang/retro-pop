import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(10, "Title is required (At least 10 characters)"),
  content: z.string().min(100, "Content is required (At least 100 characters)"),
  imageUrl: z.string().optional(),
});

export type PostFormData = z.infer<typeof postSchema>;
