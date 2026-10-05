// GET /api/v1/denials: every synthetic demo denial with its pre-generated triage, plus
// the ranked queue as IDs (ADR 0022). Open and served from files.
import { summarize } from "@/lib/api";
import { json } from "@/lib/http";
import { buildQueue } from "@/lib/queue";
import { demoCases } from "@/lib/cases";
import { LETTERS, TRIAGE } from "@/lib/store";

export const dynamic = "force-dynamic"; // deadlines are relative to today

export function GET() {
  const today = new Date();
  const q = buildQueue(demoCases(today), TRIAGE, today);
  const ids = (rows: { kase: { id: string } }[]) => rows.map((r) => r.kase.id);
  return json({
    synthetic: true,
    queue: { urgent: ids(q.urgent), later: ids(q.later), quick_fixes: ids(q.quick_fixes), needs_person: ids(q.needs_person) },
    denials: LETTERS.map((l) => summarize(l.id, today)).filter(Boolean),
  });
}
