# 0016 Add Gemini Flash-Lite as a third baseline
Status: accepted
Date: 2026-10-04
Context: ADR 0015 compares Jev against a keyword baseline and Claude Haiku. Budget remains, and the author asked for the cheapest Gemini classifier as another point of comparison on cost and accuracy.
Decision: Add `gemini-3.1-flash-lite` (`poc/evals/gemini.ts`). It gets the same prompt and six questions as Haiku, with structured output, temperature 0 and thinking off. It is the cheapest Gemini model this key can use: `gemini-2.5-flash-lite` is cheaper but returns 404 ("no longer available to new users"). Price $0.25 / $1.50 per million tokens (V32). `--final` runs all four engines.
Alternatives: No Gemini engine (fewer reference points); Gemini 3.5 Flash-Lite (pricier, $0.30 / $2.50); Gemini 3.8 Flash (the generator model, pricier, and the most circular).
Consequences: Gemini also wrote the synthetic letters, so it may be advantaged on them; the report must say so. The holdout pre-registration must list four engines. Adds about $0.0004 per letter.
