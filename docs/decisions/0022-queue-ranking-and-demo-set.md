# 0022 Queue ranking by deadline band, then rules-conflict probability; dev letters as the demo set
Status: accepted
Date: 2026-10-04
Context: ADR 0014 ranks by rules-conflict probability "combined with" the appeal deadline but doesn't say how. The demo needs letters with chart facts and deadlines; eval letters have neither.
Decision:
- Bands: due within 7 days, then the rest; each sorted by the highest rules-conflict probability (the measure behind Jev's 100% top-10 precision in `poc/evals/REPORT.md`). "Send documents" letters go to a Quick fixes list and manual review to Needs a person.
- Rows show a deadline ring and the case strength in words; numbers appear only in the detail card.
- Demo set: about 12 of the 40 dev letters in the queue, all 40 in the picker, each with invented chart facts and a denial date relative to today. Deadlines use the 65-day MA reconsideration window (V34). Golden and holdout letters are not used.
Alternatives: one blended score (order is hard to explain); freshly generated letters (cost and time; unlabelled).
Consequences: The deadline band is product logic, not evaluated. Dev letters were the tuning set, so the demo shows Jev at its best case.
