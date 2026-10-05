# 0019 Open demo: no login, spend caps and a pre-generated fallback
Status: accepted
Date: 2026-10-04
Context: ADRs 0012 and 0014 put the UI behind a passcode cookie and the API behind a bearer token. The likely visitor is a hiring manager; a login box is friction, and auth a visitor can't see adds little. API balances are small and have no auto-refill.
Decision:
- No auth. The UI is open and pre-generated: a queue of synthetic dev letters, a letter picker and a "Run live" button. No free-text input in the UI.
- Live calls (`POST /api/v1/triage`, `POST /api/v1/denials/{id}/appeal-drafts`) are capped: per-IP limit (10 a minute) and global daily caps (100 Claude, 300 Jev), in Upstash with an in-memory fallback for local dev.
- On any live failure or cap, the route returns the pre-generated result with a note that the live budget is used up and the repo can be run with your own keys.
- Kept: security headers, zod and a 20 KB body cap, the PHI tripwire on text inputs, keys server-side only, sanitised errors. Provider console spend limits are the real backstop.
Alternatives: passcode cookie plus bearer token (supersedes those parts of 0012 and 0014; friction for little protection); GET-only API (drops the live demo).
Consequences: Anyone can spend the daily cap; the fallback keeps the demo working. "Run it yourself" needs the repo public (V35).
