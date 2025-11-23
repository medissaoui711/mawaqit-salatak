import { z } from "zod";

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(2000, "الرسالة طويلة جداً").min(1, "الرسالة لا يمكن أن تكون فارغة"),
    })
  ),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;