# 0021 The app flags letters for a second look with the ADR 0018 rule
Status: accepted
Date: 2026-10-04
Context: The evaluated rule (any reason probability in 0.3-0.7) flags about half of Jev's letters. ADR 0018's rule (flag only if an uncertain reason could change the next step) flagged 18% on the holdout but was found after the run. A person approves every draft before it is sent, so the flag directs attention; it doesn't gate anything.
Decision: The app uses the ADR 0018 rule as a tunable default in `poc/lib/handoff.ts`, shown as a quiet "Double-check" marker with the uncertain question in the row's detail card and an "untested rule" note there and on the eval page. `verdictOf` and the evaluated files are unchanged.
Alternatives: the evaluated rule (half the queue flagged); a click-through review flow (unneeded when every letter is approved anyway).
Consequences: The app shows untested routing; confirming it needs fresh blind-labelled letters.
