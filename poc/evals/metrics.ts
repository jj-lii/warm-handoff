// Eval metrics (ADR 0015). Pure functions over scored items; no I/O.
// Gold comes from the author's blind labels. A letter's gold next step is
// verdictOf(labels), the same rule the product applies to its own detections.
import { REVIEW_BAND, THRESHOLD } from "../lib/classify";
import { verdictOf, type Verdict } from "../lib/check";
import { LABELS, RULES, type Label } from "../lib/rules";

export type Scored = {
  id: string;
  gold: Label[];
  unsure: boolean;
  hard: boolean; // a distractor or an out-of-scope reason (generator metadata)
  probabilities: Record<Label, number>;
  probabilistic: boolean; // false for the keyword baseline (0 or 1 only)
  latency_ms: number;
  usage?: { input_tokens: number; output_tokens: number };
};

export type Interval = { value: number | null; lo: number | null; hi: number | null; k: number; n: number };

// Wilson score interval, 95%.
export function wilson(k: number, n: number, z = 1.96): Interval {
  if (n === 0) return { value: null, lo: null, hi: null, k, n };
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { value: p, lo: Math.max(0, c - h), hi: Math.min(1, c + h), k, n };
}

const CONFLICTS = LABELS.filter((l) => RULES[l].action === "rules_conflict");

export const predicted = (s: Scored, t = THRESHOLD) => LABELS.filter((l) => s.probabilities[l] >= t);
export const predictedVerdict = (s: Scored, t = THRESHOLD): Verdict => verdictOf(predicted(s, t));
export const goldVerdict = (s: Scored): Verdict => verdictOf(s.gold);
// Queue rank (ADR 0014) without the deadline term: synthetic letters carry no deadlines.
export const conflictScore = (s: Scored) => Math.max(...CONFLICTS.map((l) => s.probabilities[l]));

// Expected precision of the top k under random tie-breaking, so a 0/1 scorer
// is not credited (or penalised) for the order its ties happen to sit in.
export function precisionAtK(items: Scored[], k: number): number | null {
  if (!items.length) return null;
  k = Math.min(k, items.length);
  const sorted = [...items].sort((a, b) => conflictScore(b) - conflictScore(a));
  const cut = conflictScore(sorted[k - 1]);
  const above = sorted.filter((s) => conflictScore(s) > cut);
  const tied = sorted.filter((s) => conflictScore(s) === cut);
  const pos = (s: Scored) => (goldVerdict(s) === "contest_on_rules" ? 1 : 0);
  const fromTied = tied.length ? ((k - above.length) / tied.length) * tied.reduce((a, s) => a + pos(s), 0) : 0;
  return (above.reduce((a, s) => a + pos(s), 0) + fromTied) / k;
}

export const queueK = (n: number) => Math.max(1, Math.round(n / 4));

const sentToPerson = (s: Scored, t: number) =>
  predictedVerdict(s, t) === "manual_review" ||
  (s.probabilistic && LABELS.some((l) => s.probabilities[l] > REVIEW_BAND[0] && s.probabilities[l] < REVIEW_BAND[1]));

export function headline(items: Scored[], t = THRESHOLD) {
  const n = items.length;
  const contestable = items.filter((s) => goldVerdict(s) === "contest_on_rules");
  const flagged = items.filter((s) => predictedVerdict(s, t) === "contest_on_rules");
  return {
    n,
    // Share of the top quarter of the queue whose gold next step is "contest on the rules".
    precision_at_top: { k: queueK(n), value: precisionAtK(items, queueK(n)) },
    // Predicted next step equals the gold next step (4 classes).
    right_next_step: wilson(items.filter((s) => predictedVerdict(s, t) === goldVerdict(s)).length, n),
    // Of letters whose gold next step is "contest on the rules", share flagged that way.
    contestable_caught: wilson(contestable.filter((s) => predictedVerdict(s, t) === "contest_on_rules").length, contestable.length),
    // Of letters flagged "contest on the rules", share whose gold next step is something else.
    wrongly_contested: wilson(flagged.filter((s) => goldVerdict(s) !== "contest_on_rules").length, flagged.length),
    // No reason detected, or (probabilistic engines) any reason inside the review band.
    sent_to_person: wilson(items.filter((s) => sentToPerson(s, t)).length, n),
  };
}

export function perLabel(items: Scored[], t = THRESHOLD) {
  return Object.fromEntries(
    LABELS.map((l) => {
      const tp = items.filter((s) => s.gold.includes(l) && s.probabilities[l] >= t).length;
      const fp = items.filter((s) => !s.gold.includes(l) && s.probabilities[l] >= t).length;
      const fn = items.filter((s) => s.gold.includes(l) && s.probabilities[l] < t).length;
      const brier = items.length ? items.reduce((a, s) => a + (s.probabilities[l] - (s.gold.includes(l) ? 1 : 0)) ** 2, 0) / items.length : null;
      return [l, { support: tp + fn, precision: wilson(tp, tp + fp), recall: wilson(tp, tp + fn), brier }];
    }),
  ) as Record<Label, { support: number; precision: Interval; recall: Interval; brier: number | null }>;
}

// Mean over items and labels.
export function brier(items: Scored[]): number | null {
  if (!items.length) return null;
  let sum = 0;
  for (const s of items) for (const l of LABELS) sum += (s.probabilities[l] - (s.gold.includes(l) ? 1 : 0)) ** 2;
  return sum / (items.length * LABELS.length);
}

export function costLatency(items: Scored[], price?: { input: number; output: number }) {
  const lat = items.map((s) => s.latency_ms).sort((a, b) => a - b);
  const q = (p: number) => (lat.length ? lat[Math.min(lat.length - 1, Math.floor(p * lat.length))] : null);
  const used = items.filter((s) => s.usage);
  const tin = used.reduce((a, s) => a + s.usage!.input_tokens, 0);
  const tout = used.reduce((a, s) => a + s.usage!.output_tokens, 0);
  return {
    latency_ms: { p50: q(0.5), p90: q(0.9) },
    tokens_per_letter: used.length ? { input: Math.round(tin / used.length), output: Math.round(tout / used.length) } : null,
    usd_per_letter: price && used.length ? (tin * price.input + tout * price.output) / 1e6 / used.length : null,
  };
}

// Dev only: how the headline moves with the decision threshold.
export function sweep(items: Scored[], thresholds = [0.3, 0.4, 0.5, 0.6, 0.7]) {
  return thresholds.map((t) => {
    const h = headline(items, t);
    return { threshold: t, right_next_step: h.right_next_step.value, contestable_caught: h.contestable_caught.value, wrongly_contested: h.wrongly_contested.value, sent_to_person: h.sent_to_person.value };
  });
}

// Exact two-sided McNemar test on paired right/wrong outcomes (same letters, two engines).
// only_a / only_b: letters only engine a (or b) got right. p is the binomial tail on those discordant pairs.
export function mcnemar(a: boolean[], b: boolean[]) {
  let onlyA = 0, onlyB = 0;
  a.forEach((x, i) => {
    if (x && !b[i]) onlyA++;
    if (!x && b[i]) onlyB++;
  });
  const n = onlyA + onlyB;
  let tail = 0;
  for (let k = 0, c = 1; k <= Math.min(onlyA, onlyB); c = (c * (n - k)) / (k + 1), k++) tail += c;
  return { only_a: onlyA, only_b: onlyB, p: n === 0 ? 1 : Math.min(1, (2 * tail) / 2 ** n) };
}
