import Link from "next/link";
import type { ReactNode } from "react";

type Section = { heading: string; content: ReactNode };

export default function InfoPage({ title, eyebrow, intro, sections, notice }: { title: string; eyebrow: string; intro: string; sections: Section[]; notice?: string }) {
  return (
    <div className="info-page">
      <header className="info-nav"><Link href="/" aria-label="VSYDE home" className="brand"><img src="/favicon.svg" width="35" height="35" alt=""/>VSYDE</Link><Link className="info-home" href="/">Back to home ↗</Link></header>
      <main className="info-content">
        <span className="info-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="info-intro">{intro}</p>
        {notice && <p className="info-note">{notice}</p>}
        {sections.map(({ heading, content }) => <section key={heading}><h2>{heading}</h2>{typeof content === "string" ? <p>{content}</p> : content}</section>)}
      </main>
    </div>
  );
}
