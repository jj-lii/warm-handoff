# 0018 Hand off to a person only when it could change the advice
Status: proposed
Date: 2026-10-04
Context: Jev sent 21 of 40 holdout letters to a person (Haiku and Gemini 5 each), mostly because of uncertain residency scores. Only 7 of the 21 could have changed the next step, and no engine's hand-offs caught most of its errors (`poc/evals/REPORT.md`, post-hoc section). Saved for later; not built.
Decision (proposed): Send a letter to a person only if some yes/no setting of its uncertain reasons (probability 0.3-0.7) gives a different next step, or if no reason is detected. On the holdout this would have sent 7 letters (18%) for Jev.
Alternatives: The current rule, any reason in the band (over-routes: 14 of Jev's 21 hand-offs didn't affect the advice); a narrower band (hides uncertainty instead of filtering it).
Consequences: Fewer pointless reviews, but it was found after the holdout ran, so it's untested; confirming it needs fresh letters. It doesn't address confident errors such as the custodial ambiguity (ADR 0017).
