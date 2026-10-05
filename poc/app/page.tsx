import Link from "next/link";
import { Badge } from "@astryxdesign/core/Badge";
import { summarize, type DenialSummary } from "@/lib/api";
import { demoCases } from "@/lib/cases";
import { buildQueue, URGENT_DAYS, type Row } from "@/lib/queue";
import { LETTERS, TRIAGE } from "@/lib/store";
import { QueueRow } from "./components/QueueRow";

export const dynamic = "force-dynamic"; // deadlines are relative to today

function Section({ title, note, rows }: { title: string; note: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="section">
      <h2>
        {title} <span className="count">{rows.length}</span>
      </h2>
      <p className="note">{note}</p>
      <ul className="rows">
        {rows.map((r) => (
          <QueueRow key={r.kase.id} d={summarize(r.kase.id)!} triage={r.triage} />
        ))}
      </ul>
    </section>
  );
}

export default function QueuePage() {
  const today = new Date();
  const q = buildQueue(demoCases(today), TRIAGE, today);
  const queued = new Set(demoCases(today).map((c) => c.id));
  const others = LETTERS.filter((l) => !queued.has(l.id)).map((l) => summarize(l.id, today)!) as DenialSummary[];

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Denied skilled stays</h1>
          <p className="lede">
            Medicare Advantage denials for long-stay residents, ranked so the ones that cite reasons Medicare doesn&apos;t accept, and are due soonest, come
            first. Hover a row for why it&apos;s there.
          </p>
        </div>
        <Badge variant="orange" label="Synthetic data only" />
      </header>

      <Section title="Due this week" note={`Appeals due within ${URGENT_DAYS} days, strongest first.`} rows={q.urgent} />
      <Section title="Later" note="Strongest first." rows={q.later} />
      <Section title="Quick fixes" note="The plan says records were missing: send them and resubmit." rows={q.quick_fixes} />
      <Section title="Needs a person" note="No known reason found. Someone should read these first; no draft is prepared." rows={q.needs_person} />

      <section className="section">
        <details>
          <summary>
            All other demo letters <span className="count">{others.length}</span>
          </summary>
          <p className="note">The rest of the synthetic dev set. No chart facts or deadlines; open one and press Run live to triage it.</p>
          <ul className="plain">
            {others.map((d) => (
              <li key={d.id}>
                <Link href={`/denials/${d.id}`}>
                  {d.member} <span className="muted">({d.id})</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <footer className="foot">
        Every letter, name and chart fact here is invented. Names are basketball players. Triage by Jev; drafts by Claude Haiku 4.5 with citations from Medicare
        Benefit Policy Manual Ch. 8. <Link href="/evals">How well does the triage work?</Link>
      </footer>
    </main>
  );
}
