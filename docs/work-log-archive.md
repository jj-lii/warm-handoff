# Work log: archive

Older entries moved from `docs/work-log.md`. Not read by default. Newest first.

## 2026-10-04 - Holdout run once; report written
Output: `poc/evals/PREREGISTRATION.md` (`876be56`); `poc/evals/REPORT.md`; `private/results/holdout-final.{json,md}` (aggregate only read); `private/holdout-final-run.json` (run marker); exact McNemar test in `evals/metrics.ts`; analysis code hash-locked
Notes:
- All four predictions held. Right next step: keyword 60%, Haiku 83%, Gemini 85%, Jev 83%; Jev vs keyword p = 0.004; Jev vs Haiku and Gemini p = 1.0. Jev 124 ms p50 and 53% sent to a person; Gemini $0.00035 per letter.
- Most model misses (5-6 of 6-7 each) are gold "facts" flagged as "rules": the custodial ambiguity named in advance. The combined "facts, then rules" next step is saved as proposed ADR 0017; decision-relevant hand-offs as proposed ADR 0018. Both untested.
- Before the run: Gemini 3.1 Flash-Lite added (ADR 0016; 2.5 Flash-Lite is closed to new keys); custodial tightening set aside as post hoc (wording kept in ADR 0017); questions frozen at `f9cfc85`.
- Report header shows rules.ts raw CRLF hash d4898e11; normalised it matches the pre-registration (noted in REPORT.md).
Next, in order:
1. Done: real slice labelled and run (REPORT.md, exploratory): Haiku 76%, Gemini 67%, Jev 62%, keyword 29%; 15 of 21 passages are "no daily skilled need", so it barely tests the rules-conflict reasons. Post-hoc: only 7 of Jev's 21 holdout hand-offs could change the next step.
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

## 2026-10-04 - POC planned; eval data generated; real-data spike (no-go)
Output: branch `poc-denial-check`; ADRs 0010-0015; `LICENSE`; `poc/lib/{rules,jev,classify,check}.ts` (draft, untested; `rules.ts` holds the frozen keyword baseline); `poc/evals/{recipes,generate,label}.ts`; `poc/evals/data/{dev,golden}.jsonl` (40 each, Gemini 3.8 Flash); `private/real-slice.jsonl` (21 Council passages, gitignored); `research/external/dab-council-decisions-spike.md`; `research/sources/dab/` (32 decisions, indexed, private)
Notes:
- Decisions: triage queue with gated pre-drafting (ADR 0014); eval design (ADR 0015); public adjudication text allowed for evals only (ADR 0013).
- Grill outcomes not in ADRs: REST API; auth with Web Crypto HMAC cookie + hashed bearer token, no auth lib; Upstash rate limit with in-memory fallback; root `.env` (Next must load it via `@next/env`); cut line, if behind: eval page, then Upstash, then UI polish; never cut holdout sealing, baselines or security basics; deck moves to the next session.
- Population (OIG PDF): about 15.4K resident denials a year at the 19 largest MAOs, about 1 per facility per year; the general engine's market is about 162K SNF denials a year.
- Gemini's free tier allows 20 requests a day; billing is now on. The generator defaults to one request at a time (`GEN_CONCURRENCY`, `GEN_INTERVAL_MS`).
Next, in order:
1. Author labels dev, then golden: `cd poc && npm run label -- dev|golden`.
2. Claude: `evals/run.ts` (keyword + Claude Haiku baselines vs Jev; metrics per ADR 0015), then golden adjudication (intent vs blind labels).
3. Author: generate and label the holdout (`npm run generate -- holdout`; Claude never opens `private/holdout.jsonl`) and the real slice (`npm run label -- real`).
4. Claude: API routes, auth, rate limits, PHI tripwire, security headers; Astryx smoke build (V24); the triage queue UI; the thin Claude drafting layer (read the claude-api skill first).
5. `PREREGISTRATION.md` committed, then a single `--final` holdout run, `evals/REPORT.md`, then the Vercel deploy.

## 2026-10-04 - End of day: research phase merged
Output: PR #2 merged to `main` (`c53bea0`)
Notes: Problem chosen and written up: long-stay residents on MA denied short-term skilled care (39.5% vs 11.5%, OIG), reasoning that conflicts with Medicare manual Ch. 8 / Jimmo / CMS-4201-F, in a referral-first workflow. Start from `reports/problem-statement.md`, `docs/decisions/0009-problem-long-stay-residents.md` and `research/landscape.md`. Open checks before the deck: V17 (no in-house start point), V21 (cost per denied stay, try MedPAC/MACPAC), V18 (I-SNP share).
Next: on a new branch, `reports/deck.md` (6-8 slides), then the prototype (synthetic resident cases plus real Ch. 8 and plan policies; Jev for denial-reason classification). The prototype is a stretch goal per BRIEF.

## 2026-10-04 - Problem statement drafted
Output: `reports/problem-statement.md`; `docs/verify.md` V21
Notes: One page per BRIEF: who has it, evidence, cost, ask-vs-problem, hypotheses, no-list, pilot measures. The Push to PCC video transcript matches the help article (one-way push at admission), consistent with V17. Cost per denied stay is unsourced (V21).
Next: author review; then `reports/deck.md`.

## 2026-10-04 - Transcribed Push to PointClickCare tutorial
Output: `research/sources/local-videos/push-to-pointclickcare-tutorial.md` (about 1,400 words, 9 min)
Notes: Local mp4 from the author, not Wistia. Transcribed locally with faster-whisper `small.en` (installed in `.venv`, `av` pinned to 16.x because 19 breaks it); auto-captions, so names and terms may be wrong. ExaCare material: keep private.
Next: use the PCC push steps (3-step flow, required NPI/phone) in the problem statement if relevant.

## 2026-10-04 - Problem chosen: long-stay residents under MA
Output: `docs/decisions/0008-narrow-shortlist.md`, `docs/decisions/0009-problem-long-stay-residents.md`, `research/problems.md` (decision section), 8 new notes in `research/external/`, `research/evidence.md`, `docs/verify.md` V14-V20
Notes: Second research round on payer power and incentives (Senate PSI, CMS-4201-F, KFF 2026 metrics, NOMNC rules, Lokken, SNN operators), Medicare manual Ch. 8 (read locally) and public data sources. Full OIG report read by a Sonnet subagent; key quotes re-checked in the PDF. Help articles on the Residents tab, Tasks and Push to PCC saved by the author; no in-house prior-auth start point found (V17).
Next: `reports/problem-statement.md`.

## 2026-10-04 - Landscape narrative
Output: `research/landscape.md`
Notes: Ten-part walk through the hospital-to-SNF journey (handoff, decision, speed, payers, denials, hospital waits, the stay, technology map, tensions, unknowns). Same sources as `research/problems.md`; items marked *background* are general domain knowledge not yet sourced in `research/external/` (3-day rule, NOMNC process, appeal levels, hospital per-stay payment).
Next: the author decides on a problem; consider sourcing the *background* items if they go into the deck.

## 2026-10-03 - Shortlist update from benchmark, help centre and slides
Output: `research/problems.md` (re-ranked), `research/evidence.md`, `docs/verify.md` (V1-V5, V9 statuses; V13 added)
Notes: Help articles show Managed Care Agent tracks Denied/Peer-to-Peer but has no appeal step (supports #1) and already picks the level of care (old #2 dropped). New #2 is rule tuning (benchmark p.11: 70% AI "Maybe"). Speed figures differ across ExaCare documents (V13). Help articles were saved by the author in a browser; robots.txt blocks bots.
Next: the author picks between #1 and #2; then `reports/problem-statement.md` and an ADR.

## 2026-10-03 - Problem shortlist
Output: `research/problems.md`, `research/evidence.md`, 5 notes in `research/external/`, `docs/verify.md` V7-V12
Notes: 4 problems ranked; recommends #1 (MA SNF denials/appeals, tier 1 OIG) with #3 (decline-pattern sizing) as fallback. Bulk summaries came from Haiku subagents; every cited figure was re-checked in the source. Outside evidence is thin for #2 and #4; the JMIR note is abstract-only.
Next: the author picks a problem; then `reports/problem-statement.md` and an ADR for the pick.

## 2026-10-03 - Docs tidy and gitignore
Output: `docs/decisions/0001-scope-and-deliverables.md`, updated `BRIEF.md`, `CLAUDE.md`, `docs/wow.md`, `docs/verify.md`, `.gitignore`
Notes: Docs reworded so they read neutrally for any reader ("company-reported" instead of "vendor claim", "the author" instead of "the user"). `.gitignore` now also covers `.env*`, downloaded PDFs under `research/external/`, `assets/raw/` and local-only notes.
Next: `research/problems.md`.

## 2026-10-03 - Repo restructure and verification queue
Output: `research/`, `poc/`, `reports/`, `assets/`, `scripts/` in place; `docs/verify.md`; `docs/decisions/0007-repo-structure.md`
Notes: `sources/` moved to `research/sources/`; scripts moved to `scripts/` with path fixes and checked; `research/sources/` added to `.gitignore`; leftover `sitemaps/` and `sitemap-index.xml` deleted. `CLAUDE.md` and `BRIEF.md` updated to match. Earlier entries below still show the old paths.
Next: `research/problems.md` (internal sources, 12 transcripts, about 8 external tier-1/2 sources).

## 2026-10-03 - Flagged video moments needing a human eye
Output: `research/video-visuals-todo.md`
Notes: Found by scanning captions for verbal cues ("you can see", "this chart", "next slide"), so visuals with no spoken pointer are missed.
Next: Review the high-priority timestamps and save screenshots.

## 2026-10-03 - ADR backfill and WOW
Output: `docs/decisions/0001`-`0006`, `docs/wow.md`
Notes: Backfilled decisions made in chat (scope, timebox, source and data rules, evidence grading, format).
Next: Repo structure proposal (`research/`, `poc/`, `reports/`, `assets/`).

## 2026-10-03 - Summit transcripts (12 videos)
Output: `sources/summit-transcripts/*.md`, `scripts/transcripts.py` (currently `transcripts.py`)
Notes: Wistia captions fetched from IDs collected from the Summit hub. About 76K words; auto-generated, so names and clinical terms have errors. Some filenames inherited typos from the source titles.
Next: Use for the problem shortlist; grep, don't read whole.

## 2026-10-03 - CLAUDE.md and BRIEF.md
Output: `CLAUDE.md`, `BRIEF.md`
Notes: Brief covers goal, timebox, budget, restrictions, known gaps.
Next: Backfill ADRs.

## 2026-10-03 - Site scrape
Output: `sources/` (57 pages), `sources/_report.md`, `scrape.py` (currently at root)
Notes: robots.txt checked first. Flagged: 12 gated Summit video pages (since resolved via transcripts), the gated Time-to-Accept Benchmark Report (teaser only), `/resources/press-releases` (404), thin index pages.
Next: Transcripts.
