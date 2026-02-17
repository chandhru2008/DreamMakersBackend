import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
});

// Optional: export inferred type
export type User = z.infer<typeof UserSchema>;