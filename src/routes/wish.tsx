import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, LockKeyhole, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { BirthdayShell } from "@/components/birthday-shell";
import { Button } from "@/components/ui/button";
import { wishSchema } from "@/lib/wish-schema";
import { startBirthdayCheckout } from "@/lib/birthday.functions";

export const Route = createFileRoute("/wish")({
  head: () => ({ meta: [
    { title: "A wish & a little love — Dola" },
    { name: "description", content: "Write Dola a birthday wish and choose your own gift amount in Nigerian naira." },
    { property: "og:title", content: "A wish & a little love — Dola" },
    { property: "og:description", content: "Send your birthday wishes and a gift for Dola." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WishPage,
});

function WishPage() {
  const [fields, setFields] = useState({ email: "", wish: "", amount: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const checkout = useServerFn(startBirthdayCheckout);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("returned")) {
      setNotice("Thank you for the birthday love. Your wish is saved; check Bachs for your payment confirmation.");
    }
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = wishSchema.safeParse(fields);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({}); setNotice(""); setBusy(true);
    try {
      const result = await checkout({ data: parsed.data });
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else setNotice(result.error || "Payment is unavailable right now. Please try again.");
    } catch { setNotice("Couldn’t open payment. Please try again in a moment."); }
    finally { setBusy(false); }
  }
  return <BirthdayShell step="02"><main className="wish-main">
    <Link to="/" className="back-link"><ArrowLeft /> BACK HOME</Link>
    <p className="eyebrow">GOOD WORDS. BIG LOVE.</p>
    <h1>A wish & a little love<span className="birthday-dot">.</span></h1>
    <p className="wish-subtitle">Something kind. Something from you.</p>
    <form className="wish-form" onSubmit={submit} noValidate>
      <div><label className="field-label" htmlFor="email">Your email</label>
        <input id="email" type="email" autoComplete="email" maxLength={255} className="wish-input" placeholder="you@example.com" value={fields.email} aria-invalid={!!errors['email']} aria-describedby={errors['email'] ? "email-error" : undefined} onChange={e => setFields({ ...fields, email: e.target.value })} />
        {errors['email'] && <p id="email-error" className="field-error">{errors['email']}</p>}
      </div>
      <div><label className="field-label" htmlFor="wish">Your birthday wish <span>FOR DOLA</span></label>
        <textarea id="wish" maxLength={2000} className="wish-input" placeholder="Happy birthday, Dola…" value={fields.wish} aria-invalid={!!errors['wish']} aria-describedby={errors['wish'] ? "wish-error" : undefined} onChange={e => setFields({ ...fields, wish: e.target.value })} />
        {errors['wish'] && <p id="wish-error" className="field-error">{errors['wish']}</p>}
      </div>
      <div><label className="field-label" htmlFor="amount">A little birthday money <span>ANY AMOUNT</span></label>
        <div className="amount-input"><span>₦</span><input id="amount" inputMode="decimal" className="wish-input" placeholder="0.00" value={fields.amount} maxLength={18} aria-invalid={!!errors['amount']} aria-describedby={errors['amount'] ? "amount-error" : undefined} onChange={e => setFields({ ...fields, amount: e.target.value })} /><span>NGN</span></div>
        {errors['amount'] && <p id="amount-error" className="field-error">{errors['amount']}</p>}
      </div>
      {notice && <div role="alert" className="form-notice">{notice}</div>}
      <Button variant="birthday" type="submit" disabled={busy}>{busy ? "Opening payment…" : "Press money"}{busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}</Button>
      <p className="payment-note"><LockKeyhole /> PAYMENTS BY BACHS · WITH LOVE, ALWAYS</p>
    </form>
  </main></BirthdayShell>;
}