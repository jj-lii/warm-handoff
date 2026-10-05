// When to ask a person to double-check a letter (ADR 0018, used by the app per ADR 0021).
// UNTESTED: found after the holdout ran. A person approves every draft anyway, so this
// only directs attention; tune HANDOFF_BAND freely. The evaluated rule (any reason in
// REVIEW_BAND) stays in check.ts as `needs_review`.
import { detected, REVIEW_BAND } from "./classify";
import { verdictOf, type Verdict } from "./check";
import { LABELS, type Label } from "./rules";

export const HANDOFF_BAND: [number, number] = REVIEW_BAND;

export type Handoff = {
  needed: boolean;
  // Uncertain reasons whose yes/no answer would change the next step.
  pivotal: Label[];
  // Every next step some setting of the uncertain reasons gives.
  possible: Verdict[];
};

export function handoff(probabilities: Record<Label, number>, band = HANDOFF_BAND): Handoff {
  const sure = detected(probabilities).filter((l) => !inBand(probabilities[l], band));
  const unsure = LABELS.filter((l) => inBand(probabilities[l], band));
  const verdicts = new Set<Verdict>();
  const pivotal = new Set<Label>();

  // At most six reasons, so trying every yes/no setting is at most 64 cases.
  for (let mask = 0; mask < 1 << unsure.length; mask++) {
    const on = unsure.filter((_, i) => mask & (1 << i));
    const v = verdictOf([...sure, ...on]);
    verdicts.add(v);
    on.forEach((l) => {
      if (verdictOf([...sure, ...on.filter((x) => x !== l)]) !== v) pivotal.add(l);
    });
  }

  const possible = [...verdicts];
  return {
    needed: possible.length > 1 || possible[0] === "manual_review",
    pivotal: LABELS.filter((l) => pivotal.has(l)),
    possible,
  };
}

const inBand = (p: number, [lo, hi]: [number, number]) => p > lo && p < hi;
