import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function BirthdayShell({ children, step }: { children: ReactNode; step: "01" | "02" }) {
  return <div className="birthday-page">
    <header className="birthday-header"><Link to="/" className="birthday-wordmark" aria-label="Dola birthday home">dola<span className="birthday-dot">.</span></Link><span className="eyebrow">A BIRTHDAY, WITH LOVE.</span></header>
    {children}
    <footer className="birthday-footer"><span>FOR DOLA. FROM YOU.</span><span className="page-count">{step}<span className="count-rule" />02</span><span>MADE OF GOOD WISHES <span className="text-accent">↗</span></span></footer>
  </div>;
}