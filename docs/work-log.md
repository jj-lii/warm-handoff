# Work log

Newest first, last 5 entries only; older ones are in `docs/work-log-archive.md`. Paths are as of the entry.

## 2026-10-04 - Holdout run once; report written
Output: `poc/evals/PREREGISTRATION.md` (`876be56`); `poc/evals/REPORT.md`; `private/results/holdout-final.{json,md}` (aggregate only read); `private/holdout-final-run.json` (run marker); exact McNemar test in `evals/metrics.ts`; analysis code hash-locked
Notes:
- All four predictions held. Right next step: keyword 60%, Haiku 83%, Gemini 85%, Jev 83%; Jev vs keyword p = 0.004; Jev vs Haiku and Gemini p = 1.0. Jev 124 ms p50 and 53% sent to a person; Gemini $0.00035 per letter.
- Most model misses (5-6 of 6-7 each) are gold "facts" flagged as "rules": the custodial ambiguity named in advance. The combined "facts, then rules" next step is in `git stash` (stash@{0}), untested.
- Before the run: Gemini 3.1 Flash-Lite added (ADR 0016; 2.5 Flash-Lite is closed to new keys); custodial tightening stashed as post hoc; questions frozen at `f9cfc85`.
- Report header shows rules.ts raw CRLF hash d4898e11; normalised it matches the pre-registration (noted in REPORT.md).
Next, in order:
1. Author: label the real slice (`npm run label -- real`); Claude runs it with the frozen code and reports it as exploratory.
2. Claude: API routes, auth, rate limits, PHI tripwire, security headers; Astryx smoke build (V24); the triage queue UI; the thin Claude drafting layer (read the claude-api skill first). Cut line if behind: eval page, then Upstash, then UI polish.
3. Deck (next session), then the Vercel deploy.

## 2026-10-04 - Golden labelled, adjudicated (proposed) and run
Output: `poc/evals/data/labels/golden.jsonl` (author); `poc/evals/data/golden-adjudication.md` (v1, 19 kept, 3 changes proposed); `poc/evals/results/golden.{json,md}`; `BRIEF.md` limitation (residency labels)
Notes:
- Rulings were written before any engine ran on golden. Author accepted all (golden v2): 3 `labeler: "adjudicated"` rows appended; blind rows kept. Blind labels match the adjudicated set on reasons 37/40 and next step 40/40; the run reports both.
- Right next step on golden: keyword 70%, Haiku 90%, Jev 90% (36/40 each, 95% CI 77-96%). Haiku fell from 100% on dev (tuned) to 90%. Jev sends 48% to a person; Haiku 13%. Jev p50 137 ms vs Haiku 1,091 ms.
- 4 of 5 next-step misses are the same boundary: "can be rendered at a custodial level / by non-licensed staff" read as custodial substitute (contest on rules) when the gold is no daily skilled need (contest on facts). Under Ch. 8 a custodial substitute is a rules conflict only when a daily skilled need exists. Golden has now been seen, so any fix must be tuned on dev and can't be judged fairly on golden.
- Residency labels were left as the author labelled them (limitation in `BRIEF.md`).
Next: decide whether to fix the custodial-vs-skilled boundary on dev; then holdout and real slice (author).

## 2026-10-04 - First full dev run (40 letters, all labelled)
Output: `poc/evals/data/labels/dev.jsonl` (author); `poc/evals/results/dev.{json,md}`
Notes:
- Right next step: keyword 63%, Haiku 93%, Jev 93% (37/40 each, 95% CI 80-97%). Haiku and Jev can't be told apart at n=40. Jev is 7x faster (p50 193 vs 1,413 ms); Haiku costs $0.0016 per letter; Jev's cost is unknown (V31).
- Jev's weak spot: 53% sent to a person (21/40), mostly residency (8) and missing documentation (6) probabilities in the 0.3-0.7 band. Haiku sends 15%, but its probabilities cluster at a few values (0.92 etc.), so its threshold sweep is flat.
- Label question: 7 of 9 letters written with a therapy-participation reason are labelled without it, though each says the member can't participate in or tolerate daily therapy; both engines say yes at 0.92-0.98. Therapy precision (22%) depends on this.
- Labels add reasons Gemini didn't intend (custodial +13, residency +7, no daily skilled need +7, no improvement +5); intent matches the labels exactly on 16/40 (40%).
- The threshold sweep keeps the review band fixed, so "sent to a person" doesn't move with the threshold.
Next: author decides the therapy labels (relabel or tighten the criterion); then tune Jev's residency and missing-documentation questions on dev; golden labelling and adjudication.

## 2026-10-04 - Eval runner built
Output: `poc/evals/{run,metrics,haiku}.ts`; `verdictOf` exported from `poc/lib/check.ts`; `@anthropic-ai/sdk` 0.131.0; `docs/verify.md` V30-V31
Notes:
- Engines: keyword, Claude Haiku 4.5 (same six questions, structured output, temperature 0, no reasoning field), Jev. Answers cached in `poc/.eval-cache/` by prompt and letter; never for the holdout.
- Metric definitions (in `metrics.ts`; freeze them in the pre-registration): gold next step = `verdictOf(labels)`; top of queue = top quarter by max rules-conflict probability, ties averaged; wrongly contested = share of "contest on the rules" flags whose gold differs; sent to a person = no reason, or any probability in the review band.
- Holdout guard: `--final` only; needs a committed `poc/evals/PREREGISTRATION.md` naming the sha256 of `rules.ts` and every split and label file; writes `private/holdout-final-run.json` so it can't run twice.
- Smoke test on the first 3 dev labels: keyword and Jev work; Haiku blocked (`ANTHROPIC_API_KEY` empty in root `.env`).
- `dev.jsonl` has duplicate ids with different texts: two `generate -- dev` runs overlapped. The runner keeps the first row per id.
Next: author fixes the dev duplicates and adds the Anthropic key; full dev run; golden adjudication.

## 2026-10-04 - Verification queue pass (Claude-checkable items)
Output: `docs/verify.md` (V10, V13, V16, V18, V20, V21, V22, V27 annotated), `docs/verify-closed.md` (V26)
Notes: PSI PDF returns 403 to bots; checked via trade press only. PMC13127000 would not load in the fetch tool. Statuses stay open until the author confirms.
Next: author confirms or rejects the annotated rows; remaining browser-only items (V6, V8, V14, V15, V17, V19, V24, V25, V28).
