# Work log

Newest first, last 5 entries only; older ones are in `docs/work-log-archive.md`. Paths are as of the entry.

## 2026-10-04 - About tab: the story behind the prototype
Output: `poc/app/about/page.tsx`, `poc/app/components/{Shell,Icon}.tsx`, `poc/app/globals.css`; V38
Notes:
- Eight short chapters: brief, sources, shortlist, narrowing to long-stay residents, what we built, evals, the no list, next steps. First item in the rail.
- Numbers from `reports/problem-statement.md` (OIG) and `poc/evals/REPORT.md`; OIG figures link to the report PDF.
- Typecheck passes; headless-Chrome screenshots at 1440 and 600 px look right.
- Second pass: author's wording from `poc/languaging.md` (company unnamed); Jev price callout (V31, author-reported); REST API bullet; page card now fills the canvas so it lines up with the rail's user panel.
Next: author reads the page; closes V31 and V38.

## 2026-10-04 - Restyled the app after ExaCare's product screens
Output: `poc/app/globals.css`, `poc/app/components/{Shell,Icon,Chips,QueueRow,SyntheticNotice}.tsx`, `poc/lib/words.ts`, `poc/app/page.tsx`, `poc/app/denials/[id]/`, `poc/app/evals/page.tsx`, `poc/app/layout.tsx`; ADRs 0023-0024; V37
Notes:
- References: `research/sources/product-screenshots/` (Screener table, Pre-Auth tab, citations, profile, modal).
- Icon rail, blue-grey canvas, white cards, Roboto, sky-blue pill button; queue as a table with AI Suggestion and Case chips; detail has a patient bar, tabs, a document pane and Assessment/Draft panels with a Citations box.
- Follow-up: hover cards forced light; captions cut; Urgency column (days left, "Due October 9th"); assessment redesigned; triage renders before the draft on Run live; synthetic chips replaced by a notice on every visit (ADR 0024). Hover checked in dark OS mode over CDP; Run live split not exercised live.
- Own wordmark, no ExaCare logo or name. Light only. Typecheck and tests pass; headless-Chrome screenshots at 1600 px and 560 px (phone still V36).
Next: author checks V36 and V37; then the Vercel deploy and the deck.

## 2026-10-04 - Queue UI, denial view and eval page
Output: `poc/app/page.tsx`, `poc/app/components/{QueueRow,DeadlineRing}.tsx`, `poc/app/denials/[id]/`, `poc/app/evals/page.tsx`, `poc/lib/words.ts`; V36
Notes:
- Queue: four sections (due this week, later, quick fixes, needs a person), deadline ring, case strength in words, hover card with the plain reason and the Double-check note. 28 other dev letters listed below.
- Denial view: letter left with highlighted passages the draft answers; draft right with citation chips, chart facts and Sources. Run live calls Jev then Claude and shows latency, or a fallback banner with the repo link.
- Checked by headless-Edge screenshots at desktop width; phone width inconclusive (V36). Hover cards not exercised headless.
Next: author checks V36 and the hover cards; adds Upstash keys and console spend limits; then the Vercel deploy (V25, V27, V35) and the deck.

## 2026-10-04 - App backend: cases, tripwire, checked Claude drafts, API
Output: `poc/app/` (Astryx smoke page), `poc/lib/{cases,handoff,phi,draft,triage,queue,store,limits,http,api}.ts`, `poc/app/api/v1/*`, `poc/scripts/pregen.ts`, `poc/data/*.json`; ADRs 0019-0022; V33-V35
Notes:
- Grilled with the author first: no auth (caps plus pre-generated fallback), Claude drafts with checked references, ADR 0018 hand-off as a tunable default, deadline bands, dev letters as the demo set.
- Astryx builds under Next 16 App Router (V24 build part). `check.ts` is hash-locked by the pre-registration, so `triage.ts` mirrors its findings logic.
- PHI tripwire passes all 80 dev and golden letters. Claude (Haiku 4.5) pre-drafts for 7 Strong case letters, $0.03; first pass failed 3 on OCR and case in quotes, fixed by tolerant matching. Live Jev triage 203 ms.
- Upstash keys are empty: caps are per-instance memory until set.
Next: queue UI (two-pane letter and draft, citation highlighting, Run live), then the eval page; Upstash keys and console spend limits (author).

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
