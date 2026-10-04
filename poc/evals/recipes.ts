// What each synthetic letter should contain. The same 40-item mix is used for dev,
// golden and holdout (each generated separately, so the wording differs).
// "intent" is what Gemini is asked to write; the author's blind labels are the gold.
import { LABELS, type Label } from "../lib/rules";

export type Format = "plan_letter" | "portal_note" | "fax_ocr" | "ire_notice" | "p2p_summary";
export type Recipe = {
  intent: Label[]; // empty = out of scope: a person should read it
  distractor?: Label; // wording that resembles this reason without it being a reason
  out_of_scope?: string;
};

const r = (s: string, extra: Partial<Recipe> = {}): Recipe => ({
  intent: s ? (s.split("+") as Label[]) : [],
  ...extra,
});

const R = "residency", T = "therapy_participation", I = "no_improvement",
  C = "custodial_substitute", N = "no_daily_skilled_need", M = "missing_documentation";

export const RECIPES: Recipe[] = [
  // 15 single-reason letters
  r(R), r(T), r(T), r(I), r(I), r(I), r(C), r(C), r(N), r(N), r(N), r(N), r(M), r(M), r(M),
  // 15 multi-reason letters
  r(`${R}+${T}`), r(`${R}+${T}`), r(`${R}+${C}`), r(`${R}+${C}`), r(`${R}+${I}`),
  r(`${T}+${I}`), r(`${T}+${I}`), r(`${I}+${C}`), r(`${I}+${M}`), r(`${R}+${T}+${C}`),
  r(`${R}+${T}+${C}`), r(`${T}+${N}`), r(`${N}+${M}`), r(`${N}+${M}`), r(`${C}+${M}`),
  // 6 hard cases: a real reason (or none) plus wording that resembles another one
  r(N, { distractor: R }),
  r(N, { distractor: I }),
  r(M, { distractor: T }),
  r(I, { distractor: N }),
  r(R, { distractor: M }),
  r("", { distractor: C, out_of_scope: "no qualifying three-day inpatient hospital stay" }),
  // 4 out of scope (5 with the hard case above): denied for something this check does not cover
  r("", { out_of_scope: "the facility is out of the plan's network" }),
  r("", { out_of_scope: "the request was submitted after the stay began, past the plan's notification window" }),
  r("", { out_of_scope: "the member has used all 100 SNF benefit days in this benefit period" }),
  r("", { out_of_scope: "duplicate request; an authorization for the same stay is already on file" }),
];

export const FORMATS: Format[] = ["plan_letter", "portal_note", "fax_ocr", "ire_notice", "p2p_summary"];

// Coverage matrix from ADR 0015, checked at import so a bad edit fails loudly.
const count = (l: Label) => RECIPES.filter((x) => x.intent.includes(l)).length;
for (const l of LABELS) if (count(l) < 8) throw new Error(`recipe coverage: ${l} has ${count(l)} < 8`);
if (RECIPES.length !== 40) throw new Error(`recipe count ${RECIPES.length} != 40`);
if (RECIPES.filter((x) => x.intent.length > 1).length < 10) throw new Error("recipe coverage: < 10 multi-reason");
if (RECIPES.filter((x) => x.distractor).length < 5) throw new Error("recipe coverage: < 5 hard cases");
const CONFLICTS = [R, T, I, C] as Label[];
if (RECIPES.filter((x) => !x.intent.some((l) => CONFLICTS.includes(l))).length < 10)
  throw new Error("recipe coverage: < 10 without a rules conflict");
if (RECIPES.filter((x) => x.intent.length === 0).length < 5) throw new Error("recipe coverage: < 5 for a person to read");
