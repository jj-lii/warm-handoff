import Link from "next/link";
import { summarize, type DenialSummary } from "@/lib/api";
import { APPEAL_WINDOW_DAYS, demoCases } from "@/lib/cases";
import { buildQueue, type Row } from "@/lib/queue";
import { LETTERS, TRIAGE } from "@/lib/store";
import { QueueRow } from "./components/QueueRow";
import { Shell } from "./components/Shell";

export const dynamic = "force-dynamic"; // deadlines are relative to today

function Section({ title, rows }: { title: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <tbody>
      <tr className="grid-group">
        <th colSpan={6} scope="colgroup">
          {title} <span className="count">{rows.length}</span>
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

        <div className="grid-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Facility</th>
                <th scope="col">Payer</th>
                <th scope="col">AI Suggestion</th>
                <th scope="col">Case</th>
                <th scope="col">Urgency</th>
              </tr>
            </thead>
            <Section title="Due this week" rows={q.urgent} />
            <Section title="Later" rows={q.later} />
            <Section title="Quick fixes" rows={q.quick_fixes} />
            <Section title="Needs a person" rows={q.needs_person} />
          </table>
        </div>

        <details className="others">
          <summary>
            All other demo letters <span className="count">{others.length}</span>
          </summary>
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
    </Shell>
  );
}
