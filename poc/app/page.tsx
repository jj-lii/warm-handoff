import Link from "next/link";
import { summarize, type DenialSummary } from "@/lib/api";
import { APPEAL_WINDOW_DAYS, demoCases } from "@/lib/cases";
import { buildQueue, URGENT_DAYS, type Row } from "@/lib/queue";
import { LETTERS, TRIAGE } from "@/lib/store";
import { SyntheticChip } from "./components/Chips";
import { QueueRow } from "./components/QueueRow";
import { Shell } from "./components/Shell";

export const dynamic = "force-dynamic"; // deadlines are relative to today

function Section({ title, note, rows }: { title: string; note: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <tbody>
      <tr className="grid-group">
        <th colSpan={6} scope="colgroup">
          {title} <span className="count">{rows.length}</span>
          <span className="group-note">{note}</span>
        </th>
      </tr>
      {rows.map((r) => (
        <QueueRow key={r.kase.id} d={summarize(r.kase.id)!} triage={r.triage} facility={r.kase.facility} deniedAgo={APPEAL_WINDOW_DAYS - r.days_left} />
      ))}
    </tbody>
  );
}

export default function QueuePage() {
  const today = new Date();
  const q = buildQueue(demoCases(today), TRIAGE, today);
  const queued = new Set(demoCases(today).map((c) => c.id));
  const others = LETTERS.filter((l) => !queued.has(l.id)).map((l) => summarize(l.id, today)!) as DenialSummary[];

  return (
    <Shell active="queue">
      <main className="card card-page">
        <div className="tabs">
          <span className="tab tab-active">Skilled-stay denials</span>
        </div>
        <div className="toolbar">
          <p className="lede">
            Medicare Advantage denials for long-stay residents, ranked so the ones that cite reasons Medicare doesn&apos;t accept, and are due soonest, come first.
            Hover a suggestion for why.
          </p>
          <SyntheticChip />
        </div>

        <div className="grid-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Facility</th>
                <th scope="col">Payer</th>
                <th scope="col">AI Suggestion</th>
                <th scope="col">Case</th>
                <th scope="col">Appeal due</th>
              </tr>
            </thead>
            <Section title="Due this week" note={`Appeals due within ${URGENT_DAYS} days, strongest first.`} rows={q.urgent} />
            <Section title="Later" note="Strongest first." rows={q.later} />
            <Section title="Quick fixes" note="The plan says records were missing: send them and resubmit." rows={q.quick_fixes} />
            <Section title="Needs a person" note="No known reason found. Someone should read these first; no draft is prepared." rows={q.needs_person} />
          </table>
        </div>

        <details className="others">
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
      </main>

      <footer className="foot">
        Every letter, name and chart fact here is invented. Names are basketball players. Triage by Jev; drafts by Claude Haiku 4.5 with citations from Medicare
        Benefit Policy Manual Ch. 8. <Link href="/evals">How well does the triage work?</Link>
      </footer>
    </Shell>
  );
}
