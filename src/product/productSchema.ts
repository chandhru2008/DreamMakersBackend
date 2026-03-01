import { z } from "zod";


export const PaginationSchema = z.object({
  // coerce automatically converts "10" (string) to 10 (number)
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(10),
});