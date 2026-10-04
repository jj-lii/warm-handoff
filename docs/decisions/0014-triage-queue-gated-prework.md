# 0014 Product shape: a triage queue with gated, speculative pre-work
Status: accepted
Date: 2026-10-04
Context: ADR 0012 framed the POC as "paste a denial, get a check". About 82% of SNF denials are never appealed (OIG), so the bottleneck is attention, not analysis. Jev is cheap enough to read every denial, and the author wants speed to be the experience (in the way Instagram uploads while you type a caption, or a login starts once the email is typed).
Decision:
- Level 0, every denial: Jev triage (six reason probabilities, a next step, an uncertainty flag), run when the denial arrives.
- Ranking: the probability that the denial conflicts with the rules, combined with how close the appeal deadline is. No dollar values (V21 unsourced; ranking residents by revenue reads badly).
- Level 1, high conviction only: a Claude pre-draft is prepared in advance, so the coordinator opens a ready draft.
- Level 1 for the rest: a draft starts speculatively when the coordinator shows intent (hover or focus on a row), before they click.
- Level 2, on request: a full letter and deeper reasoning for the next appeal level.
- Gates: a threshold for pre-drafting, a daily cap on Claude calls, and drafts cached per denial and rules version.
- API (REST): `GET /api/v1/denials`, `GET /api/v1/denials/{id}`, `POST /api/v1/triage` (stateless), `POST /api/v1/denials/{id}/appeal-drafts`.
- Auth: an HMAC-signed cookie for the UI and a hashed bearer token for the API, using Web Crypto with no auth library.
Alternatives: Paste-and-check only (no use of Jev's low cost; the user still reads every letter); pre-drafting every denial (wastes Claude calls on denials that shouldn't be contested); ranking by revenue (unsourced and ethically off).
Consequences: New metrics: precision at the top of the queue; pre-draft precision (wasted drafts); time to first draft. Pre-drafting spends money on predictions, so the threshold is a cost decision as well as an accuracy one. The demo queue is synthetic; triage and pre-drafts for it are computed by a script, not on page load.
