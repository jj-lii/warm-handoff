# 0007 Repo structure
Status: accepted
Date: 2026-10-03

Context: Work falls into research, a POC, and write-ups. Screenshots and synthetic data also needed homes, and the evidence trail is the main way this project can fail.
Decision:
- `research/` holds `sources/` (scraped, gitignored), `external/` (one note per credible source with its tier), `problems.md` and `evidence.md` (claim -> source ledger).
- `poc/` holds the build; `poc/data/` holds synthetic data only.
- `reports/` holds the problem statement and deck.
- `assets/` holds screenshots and images; `scripts/` holds scrapers.
- `docs/` holds `decisions/`, `wow.md`, `work-log.md`, `verify.md`.
Alternatives: Flat layout with files at the root (rejected: it was already getting messy).
Consequences: Paths in older work-log entries are stale; later entries note the move. Scripts resolve paths from their own location, so they run from any working directory.
