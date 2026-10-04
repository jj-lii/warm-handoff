# Ways of working

- **Grep before reading.** Transcripts total ~76K words; read only relevant sections. Reason: usage limits.
- **Write findings to files, not long chat replies.** Reason: output survives usage limits and context resets.
- **No subagents unless asked.** Reason: each one starts cold and costs more.
- **One phase, one output file, then stop.** Reason: the author decides what happens next (e.g. picking the problem).
- **Ask before moves, deletes, installs and anything outward-facing.** Includes restructuring, `rm`, new dependencies and form submissions. Reason: these are hard to undo.
- **No commits or pushes unless asked.**
- **Cite or cut.** Every number gets a source; ExaCare's own figures are tagged company-reported.
- **Log after each piece of work; write the ADR before moving on from a chat decision.**
- **Flag assumptions for manual verification.** Mark with `VERIFY:` in chat and add a row to `docs/verify.md`. Reason: a company-reported figure or an inference must not quietly become a fact in a deliverable.
