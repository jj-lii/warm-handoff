# 0024 Label synthetic data with a notice on every visit, not per-page tags
Status: accepted
Date: 2026-10-04
Context: BRIEF.md requires synthetic data to be labelled as synthetic. Orange "Synthetic data" chips on every page cluttered the product look (ADR 0023); the author asked for a pop-up instead.
Decision: A modal on every full page load says all data is synthetic and names are basketball players. Per-page chips and captions are removed. The letters and the draft header keep their own "synthetic" text.
Alternatives: keep the chips (clutter); show the notice once per browser via localStorage (a visitor arriving from a shared link could miss it).
Consequences: One click per visit. Screenshots taken right after load show the modal.
