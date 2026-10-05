# Work log

Newest first, last 5 entries only; older ones are in `docs/work-log-archive.md`. Paths are as of the entry.

## 2026-10-05 - Letter dates: catch OCR-garbled dates too
Output: `poc/lib/cases.ts`, `poc/lib/cases.test.ts`
Notes:
- The first fix missed the deliberately OCR-garbled dates (dev-002 "Apri1", dev-008 "1O/14/2O26", dev-039 "0CTOBER"). They now match loosely and the new date keeps the same swaps; all 12 queued letters agree.
- Fixed a stray ",;" in a dev-005 chart fact.
Next: send the email to the hiring team.

## 2026-10-05 - Letter dates follow the case's denial date
Output: `poc/lib/cases.ts` (`redateLetter`), `poc/lib/cases.test.ts`, `poc/app/denials/[id]/DenialView.tsx`
Notes:
- 9 of 12 queued letters printed fixed dates that disagreed with the app's moving "Denied" date; 4 were reviewed after the denial (Oct 14).
- The denial view now rewrites the letter's date at display time; "submitted for review" and "DOS REQ" land 2-3 days earlier. Draft highlights are remapped.
- Source data, triage and the text sent to Claude are unchanged.
Next: send the email to the hiring team.

## 2026-10-05 - Deployed; README rewritten; verification queue closed
Output: https://warm-handoff-nine.vercel.app/ (Vercel, root `poc`, branch `main`); `README.md`; `docs/verify-closed.md`
Notes:
- Smoke test: all pages and read APIs 200; security headers present; PHI tripwire 422; live Jev (135 ms) and live Claude draft both `live: true`.
- Secrets sweep of history and live JS bundles clean. `warm-handoff.vercel.app` belongs to someone else; share the `-nine` domain.
- V30 and V32 confirmed with prices; all other rows closed by the author.
Next: send the email to the hiring team.

## 2026-10-04 - Deploy prep: links, layout, repo public
Output: `poc/app/{about,evals}/page.tsx`, `poc/app/denials/[id]/DenialView.tsx`, `poc/app/globals.css`, `.env.example`
Notes:
- Every source chip and citation links to its public document (OIG PDF, Ch. 8 PDF, CMS-4201-F fact sheet, REPORT.md on GitHub); all four URLs return 200. Anchors checked on all 40 denial pages.
- Text no longer capped at 75ch; the denial page card fills to the rail's user panel. `.env.example` lists only the vars the app reads.
- Pre-public scan: no `private/`, holdout, `research/sources/`, `.env`, PDFs or key-like strings in any commit (V35). Branch merged to `main`; old branches deleted; repo made public.
- Upstash keys and console spend limits set by the author.
Next: Vercel import (root `poc`, production branch `main`); then V36 on a phone.

## 2026-10-04 - About tab: the story behind the prototype
Output: `poc/app/about/page.tsx`, `poc/app/components/{Shell,Icon}.tsx`, `poc/app/globals.css`; V38
Notes:
- Eight short chapters: brief, sources, shortlist, narrowing to long-stay residents, what we built, evals, the no list, next steps. First item in the rail.
- Numbers from `reports/problem-statement.md` (OIG) and `poc/evals/REPORT.md`; OIG figures link to the report PDF.
- Typecheck passes; headless-Chrome screenshots at 1440 and 600 px look right.
- Second pass: author's wording from `poc/languaging.md` (company unnamed); Jev price callout (V31, author-reported); REST API bullet; page card now fills the canvas so it lines up with the rail's user panel.
Next: author reads the page; closes V31 and V38.
