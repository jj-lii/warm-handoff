# 0015 Eval design: blind labels, golden set, sealed holdout, two baselines
Status: accepted
Date: 2026-10-04
Context: Evals are the core of the POC (ADR 0012), and we write the rules, the questions and the data, which invites Goodhart. Public adjudicated data is too thin and too old for a test set (ADR 0013, `research/external/dab-council-decisions-spike.md`).
Decision:
- Data:
  - Synthetic letters written by Gemini 3.8 Flash (non-Claude) from a spec that avoids our taxonomy wording. The author labels them blind; Gemini's intended reasons are kept as a second signal.
  - Splits: dev (40, tune freely); golden (40, curated to a coverage matrix, adjudicated with a written reason per item, versioned, the regression gate); holdout (40, generated and labelled by the author, unseen by Claude, run once with `--final` after a committed pre-registration that hashes every split and `rules.ts`); real slice (~20 Council rationale passages, labelled blind, private).
- Baselines: keyword regex (frozen and committed before Jev's first run) and Claude Haiku given the same six questions with structured output.
- Headline, on the holdout, each engine side by side:
  - precision at the top of the queue
  - right next step
  - contestable denials caught
  - wrongly contested
  - share sent to a person
  - real-slice agreement
- Full report: per-reason precision/recall with Wilson intervals, Brier score, a hard-case slice, cost and latency per letter.
Alternatives: Author-written synthetic set only (circular); Council decisions as the test set (no-go: 1 post-Jimmo, outcomes under the old standard); a single benchmark without a holdout (it leaks through repeated tuning).
Consequences: About 140 letters for the author to label. Results describe synthetic letters, not real-world prevalence or appeal outcomes (V23); the pilot measures those. Gemini, Anthropic and TypeSafe keys are all needed for evals.
