# ExaCare PM prototype: briefing

## Goal
A problem statement, pitch deck, and working proof of concept in ExaCare's post-acute care space, motivated by the Toronto Product Manager posting, which says PMs "create prototypes".

## Idea
1. **Sources:** public ExaCare articles, scraped into `research/sources/` (57 pages: blog, customer stories, news, product and segment pages), plus Summit 2026 talk transcripts.
2. **Problem:** pick one real post-acute problem the sources point to. The pick has to be defensible from the sources, not from guesswork about ExaCare's internals.
3. **Problem statement:** one page. Who has the problem, what it costs, evidence from the sources, what we are deliberately not solving.
4. **Pitch deck:** 6-8 slides.
5. **POC:** small, runnable, synthetic data only.

## What the work has to show
- User-discovery instinct: separating the pain point from the requested solution.
- Product judgment: tradeoffs and an explicit "no" list.
- Builder ability: a prototype that runs.
- Domain effort: reads like someone who studied how SNF admissions work.

## Timebox
- **Start:** Sat Oct 3, 2pm. **Stop:** end of Sunday Oct 4.
- Phases are small and independent. Each should leave something usable on disk.

| Phase | Output | Target |
|---|---|---|
| Read key sources, shortlist problems | `research/problems.md` (3-4 candidates, ranked) | Sat |
| Pick one + problem statement | `reports/problem-statement.md` | Sat |
| Deck (markdown) | `reports/deck.md` | Sun |
| POC (scope TBD) | `poc/`, runnable, synthetic data | Sun, only if time remains |
| Review and polish | all of the above | Sun night |

If a phase runs over, cut scope instead of extending. The problem statement and deck are the deliverable; the POC is the stretch. If the POC doesn't fit, ship a clickable mock or a described flow and say so honestly.

## Budget
Tool usage limits are rolling, so be economical:
- Read the ~10 most relevant sources in full, not all 57. Grep the rest.
- Avoid subagents and large re-reads of files already in context.
- Keep outputs short; write findings to files, not long chat replies.
- If a limit is hit, stop and resume after reset; every phase leaves its output on disk.
- API spend to date (author-reported, 2026-10-04): TypeSafe (Jev) $5 CAD, Gemini $8 CAD, Anthropic $5 USD.
## Restrictions
- **No patient data.** Synthetic or invented data only, labeled as such everywhere. No real PHI, ever.
- **Public sources only.** Gated content is reached only through the normal public flow in a viewer's own browser; no workarounds. Video transcripts come from public captions once a viewer has opened the page.
- **Respect the site.** robots.txt allows the pages scraped; keep a delay between requests.
- **Scraped content stays out of the repo.** `research/sources/` is ExaCare's copyrighted material (gitignored): don't publish it, and don't paste long passages into the deck or POC. Quote short, attribute, link.
- **No claims about ExaCare's internal product or numbers** beyond what they've published. Frame everything as a hypothesis from public material.
- **Every number on a slide needs a source** (an article, the benchmark teaser, a customer story). Unsourced numbers get cut.
- **No commits or pushes** unless asked.
- **Flag what the author should verify by hand.** Mark it `VERIFY:` in chat and log it in `docs/verify.md`.

## Limitations / known gaps
- The 12 Summit 2026 videos are email-gated Wistia embeds. Transcripts are pulled from auto-captions, so quotes and numbers must be checked against the video.
- The 2026 Time-to-Accept Benchmark Report (256,719 referrals, 981 facilities) is a gated teaser only.
- The prototype can't connect to real EHRs or referral data, so it demos a workflow on fake packets.

## Still open
- POC scope and stack (clickable demo vs. a working pipeline with a model call on fake packets). Decide after the problem is chosen.
- Which Summit video moments need screenshots: see `research/video-visuals-todo.md`.
