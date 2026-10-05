# 0017 Ambiguous custodial wording: a combined next step
Status: proposed
Date: 2026-10-04
Context: Payer wording like "her needs can be met by custodial staff" reads two ways: the care isn't skilled (contest on the facts), or the care she already gets will do (contest on the rules, Ch. 8 §30). The author's labels split on it between dev and golden, and it caused 5-6 of each model engine's 6-7 wrong next steps on the holdout (`poc/evals/REPORT.md`, prediction 4). Saved for later; not built.
Decision (proposed):
- A fifth next step, "contest on facts, then rules", when a letter gives both a clinical reason (no daily skilled need) and a rules-conflict reason. The draft leads with chart evidence of daily skilled need, then cites Ch. 8: custodial or intermittent care can't substitute for a daily skilled need. It's the right appeal under either reading. Today the rules always take precedence (`verdictOf` in `poc/lib/check.ts`).
- Narrow the custodial question to an explicit substitute. Criteria tried on dev 2026-10-04, not used in any reported result:
  - true: "The denial offers the member's existing custodial care, intermittent or periodic therapy or nursing visits, or a lower level of care as a substitute for the skilled stay."
  - false: "No substitute level of care or existing support is offered as a reason. Saying the services are not skilled, so aides, non-licensed staff or custodial staff can provide them, is a finding that skilled care isn't needed and does not count here, even if the words 'custodial care' appear."
  - Dev with that wording, against the existing labels: right next step Haiku 95%, Gemini 85%, Jev 88% (from 100%, 95%, 93%); wrongly contested 0% for all three. It fixes false contests but misses letters labelled custodial plus no daily skilled need, which is why it needs the combined next step rather than standing alone.
Alternatives: Relabel letters to one reading (rejected 2026-10-04: changes the answer key after seeing results); keep rules-first precedence and report the ambiguity as a finding (current state).
Consequences: Next-step classes go from 4 to 5, so metrics change and earlier results aren't comparable. dev, golden and the holdout have all been seen, so testing it needs freshly generated, blind-labelled letters and its own pre-registration.
