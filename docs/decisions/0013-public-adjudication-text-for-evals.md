# 0013 Public adjudication text allowed for evals, not for the demo
Status: accepted
Date: 2026-10-04
Context: A synthetic eval written, labelled and judged by us risks testing only our own assumptions (Goodhart). Medicare Appeals Council decisions are real, public-domain, initials-only records of SNF denials and their outcomes. ADR 0004 says synthetic data only.
Decision: Supersedes ADR 0004 for this use only. Public adjudication text may be used as private eval and reference data:
- saved by hand (hhs.gov blocks automated clients), kept in gitignored `research/sources/dab/`
- never loaded into the app, demo or repo
- published only as aggregate results, docket numbers with links, and short quotes that identify nobody
- demo cases stay synthetic (basketball names), though they may be modelled on real reasoning patterns
Alternatives: Strictly synthetic (keeps the Goodhart problem with no outside check); real cases in the demo (legal as public domain, but re-identification risk and poor optics for a PHI-handling audience).
Consequences: The spike found the data too thin and too old for a test set (`research/external/dab-council-decisions-spike.md`), so it serves as a smoke slice and a writing reference. ADR 0004 still governs everything else.
