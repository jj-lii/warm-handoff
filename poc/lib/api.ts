// Response shapes shared by the API routes and the UI.
import { appealDeadline, daysLeft } from "./cases";
import { strength, type Strength } from "./queue";
import { caseFor, LETTERS, TRIAGE } from "./store";
import type { Verdict } from "./check";

export type DenialSummary = {
  id: string;
  member: string;
  synthetic: true;
  in_queue: boolean; // has a demo case (chart facts, plan, deadline)
  plan: string | null;
  deadline: string | null;
  days_left: number | null;
  verdict: Verdict;
  strength: Strength;
  rules_conflict: number;
  double_check: boolean; // ADR 0018 rule, untested (ADR 0021)
};

export function summarize(id: string, today = new Date()): DenialSummary | null {
  const l = LETTERS.find((x) => x.id === id);
  const t = TRIAGE[id];
  if (!l || !t) return null;
  const kase = caseFor(id, today);
  return {
    id,
    member: l.member,
    synthetic: true,
    in_queue: Boolean(kase),
    plan: kase?.plan ?? null,
    deadline: kase ? appealDeadline(kase) : null,
    days_left: kase ? daysLeft(kase, today) : null,
    verdict: t.verdict,
    strength: strength(t),
    rules_conflict: t.rules_conflict,
    double_check: t.handoff.needed,
  };
}
