import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BirthdayShell } from "@/components/birthday-shell";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Wish Dola a Happy Birthday" },
    { name: "description", content: "A little love for Dola. Leave a birthday wish and send a gift in naira." },
    { property: "og:title", content: "Wish Dola a Happy Birthday" },
    { property: "og:description", content: "A little love for Dola. A wish, a gift, a happy birthday." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});
function Index() {
  return (
    <BirthdayShell step="01">
      <main className="birthday-home">
        <p className="eyebrow"><span className="tiny-square" /> A LITTLE LOVE GOES A LONG WAY</p>
        <h1>Wish <span className="dola-name">Dola</span> a<br />Happy Birthday<span className="birthday-dot">.</span></h1>
        <p className="home-description">Good words. Warm wishes. A little birthday money.</p>
        <Button variant="birthday" asChild><Link to="/wish">Make a wish <ArrowUpRight /></Link></Button>
        <p className="home-note">Big love. Any amount.</p>
      </main>
    </BirthdayShell>
  );
}
