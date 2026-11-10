import Link from "next/link";
import type { ReactNode } from "react";

type Section = { heading: string; content: ReactNode };
const links = [
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/contact", label: "Contact" },
];

export default function InfoPage({ title, eyebrow, intro, sections, notice }: {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Section[];
  notice?: string;
}) {
  return (
    <div className="info-page">
      <header className="info-nav">
        <Link href="/" aria-label="vsyde home" className="brand"><img src="/favicon.svg" width="35" height="35" alt=""/>vsyde</Link>
        <Link className="info-home" href="/">Back to home <span aria-hidden="true">↗</span></Link>
      </header>
      <main id="main-content" className="info-content">
        <span className="info-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="info-intro">{intro}</p>
        {notice && <p className="info-note" role="note">{notice}</p>}
        {sections.map(({ heading, content }) => (
          <section key={heading} aria-label={heading}>
            <h2>{heading}</h2>
            {typeof content === "string" ? <p>{content}</p> : content}
          </section>
        ))}
        <p className="info-bottom-link">Have another question? <Link href="/contact">Visit the contact page <span aria-hidden="true">↗</span></Link></p>
      </main>
      <footer className="info-footer">
        <Link href="/" aria-label="vsyde homepage">© {new Date().getFullYear()} vsyde</Link>
        <nav aria-label="Information pages">
          {links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
      </footer>
    </div>
  );
}
