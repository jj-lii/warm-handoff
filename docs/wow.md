# Ways of working

- **Grep before reading.** Transcripts total ~76K words; read only relevant sections. Reason: usage limits.
- **Write findings to files, not long chat replies.** Reason: output survives usage limits and context resets.
- **Fan bulk work out to cheaper subagents; keep judgment on the main model.** The author runs Opus as the main session. Haiku takes bulk reading and summarising, Sonnet takes drafting and structured extraction, and the main model decides, verifies and writes the final text. Reason: cheaper than doing it all on Opus. Standing approval from the author (2026-10-04).
- **Subagents are fresh, not forks.** Use `fork` only when the task needs the session's context. Give each a self-contained prompt, a file path to write findings to, and a length cap. Run independent ones in parallel. Re-check every cited figure against the source before using it. Reason: forks inherit and re-pay for the whole context, and summaries have garbled numbers before (V9, V12).
- **One phase, one output file, then stop.** Reason: the author decides what happens next (e.g. picking the problem).
- **Ask before moves, deletes, installs and anything outward-facing.** Includes restructuring, `rm`, new dependencies and form submissions. Reason: these are hard to undo.
- **No commits or pushes unless asked.**
- **Commits and PRs use one format** (`type(scope): summary` plus What changed / What this impacts / What are the risks, six bullets max in total; over six means split). Template in `CLAUDE.md`. Reason: small, reviewable units and a readable history.
- **Cite or cut.** Every number gets a source; ExaCare's own figures are tagged company-reported.
- **Log after each piece of work; write the ADR before moving on from a chat decision.**
- **Cap append-only logs.** `docs/work-log.md` keeps the last 5 entries; older ones move to `docs/work-log-archive.md`. Reason: every session pays to read the live file.
- **Resolved verify rows move out.** Once the author marks a row confirmed, wrong, dropped or decided, it moves to `docs/verify-closed.md`; open rows stay one line each. Reason: the queue stays short enough to read.
- **Don't read a file whole unless it is under about 500 words.** Longer files get a short summary at the top; grep the rest. Reason: usage limits.
- **Flag assumptions for manual verification.** Mark with `VERIFY:` in chat and add a row to `docs/verify.md`. Reason: a company-reported figure or an inference must not quietly become a fact in a deliverable.
