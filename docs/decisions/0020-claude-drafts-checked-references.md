# 0020 Claude drafts with checked references; citations built by the server
Status: accepted
Date: 2026-10-04
Context: ADR 0012 kept every sentence of the draft from `rules.ts` or chart facts, so no citation could be invented. The template can't quote the payer's wording, match chart facts to reasons, or flag reasons outside the six labels. Verifiable citations are what make the output trustworthy (ExaCare markets "traceable in-line citations rather than black-box scores"; V33).
Decision:
- Claude Haiku 4.5 returns structured paragraphs: its own prose, citation IDs from `rules.ts`, exact quotes from the denial, and chart-fact IDs from the case. It may leave `[Coordinator: address "..."]` for reasons outside the six labels.
- The server checks every ID and quote (exact substring), then renders the citation blocks and Sources itself. Any failure falls back to the template draft from `lib/check.ts`, labelled as such.
- No draft when the next step is manual review. Drafts are cached per letter, `rules.ts` hash and model; pre-drafts only for "Strong case" letters, made by a script.
- Draft wording is not evaluated and isn't claimed to be; the existing "DRAFT for review" header stays.
Alternatives: polish-only (wastes Claude on wording); free-form draft with citations validated after (citations can still drift); template only (no Claude).
Consequences: Claude prose can still misstate the rules in its own words; the citation blocks are the check. The combined "facts, then rules" argument (ADR 0017) is not used.
