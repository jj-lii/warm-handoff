# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A weekend research-and-prototype project, not an application. It builds a problem statement, pitch deck and proof of concept motivated by ExaCare's Toronto Product Manager posting. `BRIEF.md` holds the goal, timebox, restrictions and budget. Read it first and don't restate it elsewhere.

Pipeline: `research/` -> problem shortlist -> `reports/` (problem statement, deck) -> `poc/`. Each phase leaves a file on disk.

Layout (rationale in `docs/decisions/0007-repo-structure.md`):
- `research/`: `sources/` (scraped ExaCare material, private), `external/` (one note per credible outside source, tiered), `problems.md`, `evidence.md` (every number mapped to its source)
- `poc/`: what the author builds; `poc/data/` holds synthetic data only
- `reports/`: problem statement, deck
- `assets/`: screenshots and images
- `scripts/`: scrapers and fetchers
- `docs/`: `decisions/`, `wow.md`, `work-log.md`, `verify.md`

## Commands

Use the repo-local venv; there is no global install. On Windows with Git Bash:

```
./.venv/Scripts/python scripts/scrape.py                      # re-scrape sitemap pages into research/sources/<section>/<slug>.md
./.venv/Scripts/python scripts/transcripts.py <id> [<id>...]  # Wistia hashed IDs -> research/sources/summit-transcripts/<slug>.md
```

There are no tests or linters. `scrape.py` writes `research/sources/_report.md`, which lists pages that were thin or failed.

## Architecture notes

- `research/sources/` is input only. Treat it as read-only, and don't hand-edit scraped files; re-run the script instead. It is ExaCare's copyrighted material: keep it private, never publish it, and quote only short attributed passages.
- `research/sources/summit-transcripts/` is about 76K words across 12 files and comes from auto-captions, so it has errors. Never read it whole: grep for terms and read only the relevant sections.
- Summit videos are email-gated Wistia embeds. Transcripts come from IDs collected in a viewer's own browser; do not submit forms or bypass the gate.
- `transcripts.py` calls Wistia's public `embed/captions/<id>.json`. A video with no captions returns `NO CAPTIONS`; the fallback is audio download plus local transcription, which needs the author's go-ahead.

## Working rules

The rules for this project are in `BRIEF.md` (restrictions, budget, limitations). The ones that bite most often:
- Synthetic data only, never real patient information, and label it as synthetic.
- No commits or pushes unless the author asks.
- Every number in a deliverable needs a cited source. Tag ExaCare's own statistics as company-reported.
- Be economical with usage: write findings to files, grep before reading, and avoid subagents.
- **Flag anything the author should verify by hand.** Mark each one in chat with `VERIFY:` and add it to `docs/verify.md` with why it matters and how to check it.

## Commits and pull requests

Same format for both. Keep it short.

**Title:** `type(scope): summary`, imperative, at most 72 characters. Types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `chore`. Scope is optional (e.g. `docs(research)`, `chore(scripts)`).

**Body:** exactly these three sections, in this order, bullets only:
```
## What changed
- technical-leaning: what was added, removed or modified

## What this impacts
- product-leaning: what this changes for the work, readers or the prototype

## What are the risks
- product and technical risks; write "None" if there are none
```

**Hard limit: six bullets in total across the three sections, one line each.** If it takes more than six, split it into more than one commit or PR. A PR is not a changelog.

Commits use the same three headings (written as `What changed:`, `What this impacts:`, `What are the risks:`), then the attribution trailer. PRs end with the attribution line and no test-plan checklist; testing gaps go under risks.

## Documentation conventions

Keep four kinds of record separate. Each entry is short (a few lines) and goes in its own place, never mixed.

**Decisions (ADRs)** go in `docs/decisions/NNNN-short-title.md`, numbered in order. One decision per file:
```
# NNNN Title
Status: proposed | accepted | superseded by NNNN
Date: YYYY-MM-DD
Context: why a choice was needed (2-3 lines)
Decision: what we chose
Alternatives: what we rejected, one line each
Consequences: what this costs or constrains
```
Write one whenever a choice would be expensive to reverse or someone might ask "why did we do it that way?" (problem selection, POC scope and stack, deck format, source-tier rules). Don't edit old ADRs; supersede them.

**Ways of working (WOW)** go in `docs/wow.md`, a single short file. It records how we operate, not what we decided about the product: budget habits, review and approval steps, naming, what needs the author's go-ahead. Each rule is one line with a one-line reason. Edit in place and keep it short.

**Work log** goes in `docs/work-log.md`, newest first. One entry per piece of completed work:
```
## YYYY-MM-DD - what was done
Output: file(s) produced
Notes: caveats, gaps, sources used
Next: the immediate next step
```

**Verification queue** goes in `docs/verify.md`: assumptions and facts to check manually. One row each: ID, the claim, why it matters, how to verify, status (open / confirmed / wrong). Add a row whenever a deliverable leans on something unconfirmed (a company-reported figure, an inference, a name, a number from a talk). Never silently resolve one; the author marks it confirmed or wrong.

Rules for all four: facts and links, not narrative; cite file paths; if a decision is made in chat, write the ADR before moving on; don't backfill history beyond what is needed to explain the current state.
