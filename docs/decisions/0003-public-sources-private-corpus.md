# 0003 Public sources only, private corpus
Status: accepted
Date: 2026-10-03

Context: We scraped ExaCare's public site (57 pages) and need Summit video transcripts, which are behind an email-gated Wistia hub.
Decision: Scrape only what robots.txt allows (it disallows /studio, /private, /api), with a delay between requests. For gated videos, a viewer opens the gate in their own browser and supplies the Wistia IDs; `transcripts.py` fetches the public captions for those IDs. Scraped content is ExaCare's copyright: keep it private, don't publish it, and quote only short attributed passages.
Alternatives:
- Submit the gate form programmatically: rejected (works around the gate).
- Download audio and transcribe locally: held in reserve for videos without captions; needs the author's go-ahead.
Consequences: Transcripts depend on caption availability and are auto-generated, so they contain errors. The gated benchmark report (256,719 referrals, 981 facilities) is still teaser-only.
