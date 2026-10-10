import { z } from "zod";

export const amountSchema = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a naira amount with up to two decimal places.").refine(value => Number(value) > 0 && Number.isSafeInteger(Math.round(Number(value) * 100)), "Enter a positive naira amount.");
export const wishSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  wish: z.string().trim().min(1, "Write a little birthday wish.").max(2000, "Keep your wish under 2,000 characters."),
  amount: amountSchema,
});
export type WishInput = z.infer<typeof wishSchema>;