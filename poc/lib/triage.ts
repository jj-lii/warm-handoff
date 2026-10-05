// Level 0 triage for the app (ADR 0014): reason probabilities to findings, next step and
// hand-off. Mirrors checkDenial() in check.ts, which is hash-locked by the evals'
// pre-registration and so isn't refactored; verdictOf() is imported, not copied.
import { classify, detected, REVIEW_BAND, type Engine } from "./classify";
import { verdictOf, type Finding, type Verdict } from "./check";
import { handoff, type Handoff } from "./handoff";
import { LABELS, RULES, type Label } from "./rules";

export type Triage = {
  letter_id: string | null;
  engine: Engine;
  model: string;
  probabilities: Record<Label, number>;
  findings: Finding[];
  verdict: Verdict;
  // Highest probability among the rules-conflict reasons: the queue's ranking measure.
  rules_conflict: number;
  handoff: Handoff;
  latency_ms: number;
};

export function fromProbabilities(
  probabilities: Record<Label, number>,
  meta: { letter_id: string | null; engine: Engine; model: string; latency_ms: number },
): Triage {
  const hits = new Set(detected(probabilities));
  const findings: Finding[] = LABELS.map((l) => {
    const p = probabilities[l];
    return {
      label: l,
      title: RULES[l].title,
      action: RULES[l].action,
      probability: round(p),
      detected: hits.has(l),
      needs_review: meta.engine === "jev" && p > REVIEW_BAND[0] && p < REVIEW_BAND[1],
      argument: RULES[l].argument,
      citations: RULES[l].citations,
    };
  }).sort((a, b) => b.probability - a.probability);

  return {
    ...meta,
    probabilities,
    findings,
    verdict: verdictOf(findings.filter((f) => f.detected).map((f) => f.label)),
    rules_conflict: round(Math.max(...LABELS.filter((l) => RULES[l].action === "rules_conflict").map((l) => probabilities[l]))),
    handoff: handoff(probabilities),
  };
}

export async function triageLive(text: string, letter_id: string | null): Promise<Triage> {
  const c = await classify(text, "jev");
  return fromProbabilities(c.probabilities, { letter_id, engine: "jev", model: c.model, latency_ms: c.latency_ms });
}

const round = (p: number) => Math.round(p * 1000) / 1000;
