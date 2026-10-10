import { describe, it, expect } from "vitest";
import { wishSchema, amountSchema } from "@/lib/wish-schema";

describe("Birthday gifts", () => {
  it("accepts a custom naira amount including kobo", () => {
    expect(amountSchema.parse("1234.56")).toBe("1234.56");
    expect(amountSchema.parse("0.01")).toBe("0.01");
  });
  it("requires a positive monetary amount", () => {
    for (const amount of ["0", "-1", "NaN", "1.234", "1e6"]) expect(amountSchema.safeParse(amount).success).toBe(false);
  });
  it("collects a valid email and nonempty birthday wish", () => {
    expect(wishSchema.safeParse({email:"friend@example.com",wish:"Happy birthday Dola",amount:"5000"}).success).toBe(true);
    expect(wishSchema.safeParse({email:"bad-email",wish:"Happy birthday",amount:"5000"}).success).toBe(false);
    expect(wishSchema.safeParse({email:"friend@example.com",wish:" ",amount:"5000"}).success).toBe(false);
  });
});