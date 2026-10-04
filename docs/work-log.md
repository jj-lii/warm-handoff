# Work log

Newest first. Paths are as of the entry; see later entries for moves.

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
