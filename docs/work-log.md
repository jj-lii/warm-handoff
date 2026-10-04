# Work log

Newest first, last 5 entries only; older ones are in `docs/work-log-archive.md`. Paths are as of the entry.

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

