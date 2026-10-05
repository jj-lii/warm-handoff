# 0023 Style the POC after ExaCare's product screens
Status: accepted
Date: 2026-10-04
Context: ADR 0010 borrowed ExaCare's layout but not its styling, and the POC read as a separate product. The author asked for it to look like ExaCare's app, using `research/sources/product-screenshots/` as the reference.
Decision: Keep Astryx (HoverCard, Banner) with its tokens overridden, and write the look in `poc/app/globals.css`: icon rail, blue-grey canvas, white rounded cards, Roboto, sky-blue pill buttons, outlined AI Suggestion chips, solid status chips, a patient bar with tabs, and a Citations box. Light mode only. Never use ExaCare's logo or name; the app has its own wordmark.
Alternatives: keep the neutral look (doesn't read as an ExaCare feature); copy assets or the logo (impersonation, and it's their IP).
Consequences: Dark mode is dropped. Roboto loads from Google Fonts. Whether this much resemblance suits the audience is V37.
