// Queue ranking (ADR 0022): appeals due within URGENT_DAYS first, then the rest; each
// band sorted by rules-conflict probability. Resubmissions and letters with no known
// reason get their own lists. Product logic layered on the triage; not evaluated.
import { daysLeft, appealDeadline, type Case } from "./cases";
import type { Triage } from "./triage";

export const URGENT_DAYS = 7;

// Plain-word case strength shown on each row instead of a probability.
export const STRENGTH = { strong: 0.85, possible: 0.5 } as const;
export type Strength = "Strong case" | "Worth a look" | "Unlikely";

export function strength(t: Pick<Triage, "verdict" | "rules_conflict">): Strength {
  if (t.verdict === "contest_on_facts") return "Worth a look"; // depends on the chart, not the letter
  if (t.verdict !== "contest_on_rules") return "Unlikely";
  return t.rules_conflict >= STRENGTH.strong ? "Strong case" : t.rules_conflict >= STRENGTH.possible ? "Worth a look" : "Unlikely";
}

// Which letters get a Claude draft prepared in advance (ADR 0014 level 1).
export const preDraft = (t: Triage) => strength(t) === "Strong case";

export type Row = {
  kase: Case;
  triage: Triage;
  deadline: string;
  days_left: number;
  strength: Strength;
};

export type Queue = { urgent: Row[]; later: Row[]; quick_fixes: Row[]; needs_person: Row[] };

export function buildQueue(cases: Case[], triage: Record<string, Triage>, today = new Date()): Queue {
  const rows: Row[] = cases
    .filter((c) => triage[c.id])
    .map((kase) => ({
      kase,
      triage: triage[kase.id],
      deadline: appealDeadline(kase),
      days_left: daysLeft(kase, today),
      strength: strength(triage[kase.id]),
    }));
  const appeals = rows.filter((r) => r.triage.verdict === "contest_on_rules" || r.triage.verdict === "contest_on_facts");
  const byConflict = (a: Row, b: Row) => b.triage.rules_conflict - a.triage.rules_conflict || a.days_left - b.days_left;
  return {
    urgent: appeals.filter((r) => r.days_left <= URGENT_DAYS).sort(byConflict),
    later: appeals.filter((r) => r.days_left > URGENT_DAYS).sort(byConflict),
    quick_fixes: rows.filter((r) => r.triage.verdict === "send_documents").sort((a, b) => a.days_left - b.days_left),
    needs_person: rows.filter((r) => r.triage.verdict === "manual_review").sort((a, b) => a.days_left - b.days_left),
  };
}
