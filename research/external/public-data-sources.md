# Real (non-synthetic) data sources considered

Not used yet. ADR 0004 (synthetic data only) covers patient data; public documents and aggregate statistics are not patient data, but any use needs the author's decision.

| Source | What it is | Access | Fits | Limits |
|---|---|---|---|---|
| Insurer prior-auth metrics (CMS-0057-F) | Per-insurer approval, denial, appeal-overturn rates and turnaround, 2025 data | Public, on each insurer's website (see `kff-2026-prior-auth-metrics.md`) | Payer behaviour | Aggregate across services; inconsistent formats |
| CMS Part C Reporting Requirements PUFs | Contract-level organization determinations and reconsiderations | Public download (CMS); recency not checked | Payer behaviour | Not SNF-specific; check latest year |
| CMS Medicare Benefit Policy Manual Ch. 8 | Official SNF coverage criteria | Public PDF | Rules (#2), compliance checks | Policy text, not cases |
| MA plans' published SNF medical policies | Plan-specific SNF level-of-care criteria, e.g. Fallon Health, Commonwealth Care Alliance, BCBS RI | Public PDFs | Real rule text; plan criteria vs Ch. 8 | Coverage varies by plan |
| MTSamples | About 5,000 de-identified sample medical transcriptions, incl. discharge summaries | Public website; credit requested | More realistic packets | Samples, not real referrals |
| MIMIC-IV-Note | 331,794 de-identified real discharge summaries, linkable to discharge location | PhysioNet credentialing (training plus data use agreement) | Realistic packets, real SNF discharges | Conflicts with ADR 0004; LLM-use restrictions (VERIFY); not a weekend task |
| CMS Provider Data Catalog / Care Compare, PBJ staffing | Real facility profiles: beds, ratings, daily staffing | Public download | Realistic fictional facilities | No capability flags like trach or vent |

Not available publicly: real referral decisions, rule overrides, or SNF-level authorization outcomes (ExaCare-internal).
