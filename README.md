# Denial Check

**A triage queue that reads every Medicare Advantage denial of a skilled nursing stay, flags the ones that conflict with Medicare's own rules, and drafts a cited reply for the strong cases.**

Built in a weekend (October 3-4, 2026) as a product-thinking exercise: find one real problem in post-acute care from public sources, then build the smallest thing that tests it. Every patient, letter and chart fact is synthetic.

**Live demo: [warm-handoff-nine.vercel.app](https://warm-handoff-nine.vercel.app/)** · Start with the **About** tab. It tells the story in eight short chapters.

---

## The problem

Long-stay nursing home residents on Medicare Advantage who need a short skilled stay are **denied 39.5% of the time, against 11.5% for everyone else**. That comes from 19 plans in June 2024, per [HHS OIG, OEI-09-24-00331](https://oig.hhs.gov/documents/audit/11694/OEI-09-24-00331.pdf).

- **The reasoning conflicts with the rules.** Insurers told OIG that residents "already have some intermittent skilled therapy supports". Medicare covers daily skilled *nursing*, not just therapy, and covers care that maintains rather than improves ([Benefit Policy Manual Ch. 8](https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/bp102c08pdf.pdf); *Jimmo*). Since 2024, MA plans must apply the same criteria ([CMS-4201-F](https://www.cms.gov/newsroom/fact-sheets/2024-medicare-advantage-and-part-d-final-rule-cms-4201-f)).
- **Hardly anyone pushes back.** Across all SNF admission denials, only 18% are appealed, and 95% of those appeals win (same OIG report).

The bottleneck is attention, not writing. So this is a triage queue, not a "paste a letter" box.

Full write-up: [`reports/problem-statement.md`](reports/problem-statement.md).

## How it works

```
denial letter ──► Jev triage ──► ranked queue ──► Claude draft ──► server check ──► person approves
                 6 yes/no        due this week     strong cases     every citation,
                 questions,      first, then by    only             quote and chart
                 ~124 ms         rules-conflict                     fact is real, or
                                 probability                        fall back to template
```

1. **Read every letter.** [Jev](https://typesafe.ai) answers six yes/no questions about each denial in about a tenth of a second. Every run this project made cost **$0.009 in total**: 160 letters and 234,403 tokens, or about $0.00006 a letter.
2. **Rank by what matters.** Appeals due within 7 days come first. Within that, letters are ordered by how likely the denial conflicts with the rules. Nothing is ranked by revenue.
3. **Draft only the strong cases.** Claude Haiku writes the draft. The server checks every citation ID, quote and chart fact against the source, and falls back to a template if any check fails. A person approves everything.

## Does it work?

We wrote the rules, the questions and the test data, so we designed the eval so we couldn't fool ourselves. The test letters were written by a different model (Gemini) and labelled blind by hand. A 40-letter holdout was sealed, the test plan was [pre-registered](poc/evals/PREREGISTRATION.md) with hashes, and the final run happened exactly once.

| Holdout (n = 40) | Keyword | Claude Haiku | Gemini Flash-Lite | **Jev** |
|---|---|---|---|---|
| Right next step | 60% | 83% | 85% | **83%** |
| Precision, top 10 of queue | 68% | 70% | 83% | **100%** |
| Latency (median) | 0 ms | 1,125 ms | 800 ms | **124 ms** |
| Cost per letter | $0 | $0.0017 | $0.00035 | **~$0.00006** |

Jev beat keyword rules (p = 0.004) and was statistically tied with the larger models, while running 6-9x faster at a fraction of the cost. The letters are synthetic, so these results say nothing yet about real-world prevalence or appeal outcomes. Full method, caveats and error analysis are in [`poc/evals/REPORT.md`](poc/evals/REPORT.md).

## What it deliberately doesn't do

General appeals drafting, hospital referrals, contesting every denial, ranking by revenue, real patient data, legal judgments, and logins. The About tab gives a one-line reason for each.

## Run it yourself

Requires Node 20+.

```bash
cd poc
npm install
cp ../.env.example ../.env   # optional: add keys for live calls
npm run dev                  # http://localhost:3000
```

With no keys, the app serves pre-generated triage and drafts. With keys, **Run live** calls Jev and Claude for real. The `.env` file lives at the repo root and is shared with the eval scripts.

| Variable | Used for |
|---|---|
| `TYPESAFE_API_KEY` | Live Jev triage |
| `ANTHROPIC_API_KEY` | Live Claude drafts |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limits and daily caps shared across instances (in-memory fallback locally) |
| `GEMINI_API_KEY` | Evals only |

Other commands, all run from `poc/`:

```bash
npm test                         # unit tests (draft checks, PHI tripwire)
npm run eval:baseline -- dev     # keyword baseline on the dev split, no keys needed
npm run eval -- golden           # all four engines on the golden split (needs keys)
```

## API

| Route | What it does |
|---|---|
| `GET /api/v1/denials` | Every demo denial with its triage, plus the ranked queue |
| `GET /api/v1/denials/{id}` | One denial |
| `POST /api/v1/triage` | Live Jev triage of one letter: `{letter_id}` or `{text}` |
| `POST /api/v1/denials/{id}/appeal-drafts` | Checked Claude draft for one denial |

The live routes are capped at 10 requests per minute per IP, plus daily caps overall. When a cap is hit or a call fails, they return the pre-generated result. Text input passes through a tripwire that rejects anything shaped like real identifiers (SSN, Medicare ID, date of birth, phone, street address).

## Repo map

| Path | What's there |
|---|---|
| `poc/` | The Next.js app, API, evals and pre-generation script |
| `poc/evals/` | Pre-registration, report, runners, synthetic letters and labels |
| `reports/` | Problem statement |
| `research/` | Landscape, evidence map, outside-source notes, rejected shortlist |
| `docs/decisions/` | 24 short ADRs, one per decision |
| `docs/verify.md` | Every assumption still waiting on a manual check |
| `BRIEF.md` | Goal, timebox, restrictions and budget |

## Built with

Next.js 16 · TypeScript · Astryx · Jev (TypeSafe) · Claude Haiku 4.5 · Gemini (evals) · Upstash Redis · Vercel. Built together with Claude Code.

## License

[MIT](LICENSE). Synthetic data only: no real patient information appears anywhere in this repo.
