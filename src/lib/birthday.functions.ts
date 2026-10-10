import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { wishSchema } from "./wish-schema";

const checkoutResponse = z.object({ checkout_id: z.string().startsWith("chk_"), checkout_url: z.string().url() });

export const startBirthdayCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => wishSchema.parse(data))
  .handler(async ({ data }): Promise<{ checkoutUrl?: string; error?: string }> => {
    const key = process.env['BACHS_SECRET_KEY'];
    if (!key) return { error: "Birthday payments aren’t ready yet. Please come back shortly." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequestHeader("cf-connecting-ip") || "unknown";
    const bytes = new TextEncoder().encode(`${ip}:${data.email.toLowerCase()}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const rateKey = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    const { data: allowed, error: rateError } = await supabaseAdmin.rpc("birthday_allow_request", { rate_key: rateKey });
    if (rateError || !allowed) return { error: "Please wait a little before trying again." };
    const id = crypto.randomUUID();
    const { error: saveError } = await supabaseAdmin.from("birthday_wishes").insert({ id, email: data.email, wish: data.wish, amount: Number(data.amount), currency: "NGN" });
    if (saveError) return { error: "Couldn’t save your wish. Please try again." };
    const api = key.startsWith("sk_sandbox_") ? "https://sandbox-api.bachs.io" : "https://api.bachs.io";
    const origin = new URL(getRequest().url).origin;
    try {
      const response = await fetch(`${api}/v1/checkout-sessions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": id },
        body: JSON.stringify({
          pricing: { currency: "NGN", amount: Number(data.amount).toFixed(2) },
          customer: { email: data.email },
          meta: { birthday_wish_id: id },
          success_url: `${origin}/wish?returned=1`,
          cancel_url: `${origin}/wish`,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) return { error: "Your wish is saved, but Bachs couldn’t open payment for this amount. Please try again." };
      const parsed = checkoutResponse.safeParse(await response.json());
      if (!parsed.success) return { error: "Your wish is saved, but payment is temporarily unavailable." };
      const url = new URL(parsed.data.checkout_url);
      if (url.protocol !== "https:" || !(url.hostname === "bachs.io" || url.hostname.endsWith(".bachs.io"))) return { error: "Payment returned an unexpected address. Please try again later." };
      const { error } = await supabaseAdmin.from("birthday_wishes").update({ checkout_id: parsed.data.checkout_id }).eq("id", id);
      if (error) return { error: "Your wish is saved, but payment couldn’t be linked. Please try again later." };
      return { checkoutUrl: url.href };
    } catch {
      return { error: "Your wish is saved. Bachs is taking a little longer—please try again shortly." };
    }
  });