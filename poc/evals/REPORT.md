# Eval report: denial-reason triage on synthetic letters

Holdout run once on 2026-10-04 (00:26 UTC on 2026-10-05) under the pre-registration in `evals/PREREGISTRATION.md` (commit `876be56`). All letters are synthetic. Per-letter holdout results stay in `private/results/` (not read by Claude); everything below is aggregate.

## Summary

- **All four pre-registered predictions held.** Jev beat the keyword baseline on the right next step (83% vs 60%, p = 0.004). Jev, Claude Haiku and Gemini Flash-Lite were statistically indistinguishable (83%, 83%, 85%).
- **The three models differ on cost, speed and routing, not accuracy.** Jev answered in 124 ms (median) against 800 ms for Gemini and 1,125 ms for Haiku. It also sent 53% of letters to a person, against 13% for the other two. Gemini cost $0.00035 a letter and Haiku $0.0017; Jev's price is unknown (V31).
- **Most errors are one ambiguity, stated in advance.** 5 to 6 of each model engine's 6 to 7 wrong next steps were letters whose correct step was to contest on the facts, which the engine flagged as a rules conflict. Prediction 4 named this weakness before the run: payer wording like "care can be provided by custodial staff" reads either as "the care isn't skilled" or as "the care she already gets will do".

## Pre-registered predictions

| # | Prediction | Result |
|---|---|---|
| 1 | Jev beats keyword on right next step (McNemar p < 0.05) | **Held.** 33/40 vs 24/40; 9 letters only Jev got right, 0 only keyword; p = 0.004 |
| 2 | No significant difference, Jev vs Haiku or Gemini | **Held.** p = 1.000 for both (1 vs 1 and 0 vs 1 discordant letters). At n = 40 this does not show equivalence. |
| 3 | Jev sends the most to a person (about 40-55%); Haiku and Gemini about 10-20% | **Held.** Jev 53%; Haiku 13%; Gemini 13% |
| 4 | Misses on "custodial staff can provide this" letters | **Consistent.** Wrong next steps that were "facts" in gold and "rules" from the engine: Haiku 5 of 7, Gemini 5 of 6, Jev 6 of 7. Custodial-substitute precision was about 50% for every model engine. Counts only; not checked letter by letter. |

## Holdout results (n = 40, 95% Wilson intervals)

| Metric | keyword | Haiku | Gemini | Jev |
|---|---|---|---|---|
| **Right next step** | 60% (45-74%) | 83% (68-91%) | 85% (71-93%) | 83% (68-91%) |
| Contestable denials caught | 81% | 96% | 96% | 96% |
| Wrongly contested | 32% | 19% | 17% | 19% |
| Sent to a person | 20% | 13% | 13% | 53% |
| Precision, top 10 of queue | 68% | 70% | 83% | 100% |
| Right next step, hard cases (n = 10) | 50% | 70% | 70% | 70% |
| Brier score (lower is better) | n/a | 0.104 | 0.154 | 0.115 |
| Latency p50 / p90 | 0 ms | 1,125 / 1,625 ms | 800 / 951 ms | 124 / 180 ms |
| USD per letter | 0 | $0.00172 | $0.00035 | unknown (V31) |

Models that answered: `claude-haiku-4-5-20251001`, `gemini-3.1-flash-lite`, `jev-1.13.0`. No engine errors.

Precision at the top of the queue is a secondary metric with no pre-registered test. Jev's 100% (10/10) against Haiku's 70% is a sign that its probabilities rank letters better, not an established result.

## How the holdout compares with earlier splits (right next step)

| Split | keyword | Haiku | Gemini | Jev | Status |
|---|---|---|---|---|---|
| dev | 63% | 100% | 95% | 93% | tuned on: optimistic |
| golden | 70% | 90% | 90% | 90% | seen after its first run |
| **holdout** | **60%** | **83%** | **85%** | **83%** | **run once, pre-registered** |

Accuracy falls from dev to golden to holdout, as expected when questions are tuned on dev. The holdout numbers are the ones to quote.

## What this shows and what it doesn't

- Shows: on synthetic MA denial letters, a model reading six yes/no questions picks the right next step about 5 times in 6, well above keyword matching. The cheapest model tested matches the others on accuracy.
- Doesn't show: real-world accuracy, prevalence or appeal outcomes (V23). One person labelled every letter, and the residency labels are inconsistent (`BRIEF.md`). Gemini wrote the letters and is also an engine. Claude wrote and tuned the questions and proposed the golden adjudication. n = 40 is low power. Full list in the pre-registration.
- The real slice (public Council passages) has not run yet. It will be reported separately as exploratory.

## The finding worth acting on

Most remaining errors are not engine failures but a genuine ambiguity in how payers write denials. "Her needs can be met by custodial staff" supports two different appeals: prove daily skilled need from the chart, or cite Chapter 8's rule that custodial or intermittent care can't substitute for a daily skilled need. Our own labeller read the same wording both ways across splits. A proposed fix, not yet tested, is to treat such letters as needing both arguments, chart evidence first, then the rule. Testing it would need fresh letters, not these splits.

## Reproducibility note

The header of `private/results/holdout-final.md` shows rules.ts sha256 `d4898e11…`. That is the raw bytes of the Windows (CRLF) working copy. With line endings normalised to LF it is `507021ca…`, the hash in the pre-registration, which is what the runner checked before running.
