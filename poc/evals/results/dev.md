# Eval: dev

Synthetic letters. Gold = author's blind labels. Threshold 0.5. rules.ts d4898e11f76c. 2026-10-05T00:23:29.389Z
Items: 40 labelled of 40 (0 marked unsure).
Generator intent matches blind labels exactly: 38% (15/40, 24%-53%).

## Headline

| Metric | keyword | haiku | gemini | jev |
|---|---|---|---|---|
| Precision, top of queue | 84% (top 10) | 100% (top 10) | 97% (top 10) | 100% (top 10) |
| Right next step | 63% (25/40, 47%-76%) | 100% (40/40, 91%-100%) | 95% (38/40, 83%-99%) | 93% (37/40, 80%-97%) |
| Contestable denials caught | 70% (21/30, 52%-83%) | 100% (30/30, 89%-100%) | 100% (30/30, 89%-100%) | 97% (29/30, 83%-99%) |
| Wrongly contested | 16% (4/25, 6%-35%) | 0% (0/30, 0%-11%) | 3% (1/31, 1%-16%) | 6% (2/31, 2%-21%) |
| Sent to a person | 25% (10/40, 14%-40%) | 15% (6/40, 7%-29%) | 10% (4/40, 4%-23%) | 48% (19/40, 33%-63%) |
| Reason set matches labels | 10% (4/40, 4%-23%) | 57% (23/40, 42%-71%) | 45% (18/40, 31%-60%) | 43% (17/40, 29%-58%) |
| Right next step, hard cases | 60% (6/10, 31%-83%) | 100% (10/10, 72%-100%) | 80% (8/10, 49%-94%) | 90% (9/10, 60%-98%) |
| Right next step, excl. unsure | 63% (25/40, 47%-76%) | 100% (40/40, 91%-100%) | 95% (38/40, 83%-99%) | 93% (37/40, 80%-97%) |
| Brier (mean over labels) | n/a | 0.075 | 0.133 | 0.110 |
| Latency p50 / p90 | 0 / 0 ms | 1087 / 1666 ms | 816 / 915 ms | 125 / 171 ms |
| Tokens in / out per letter | n/a | 1381 / 64 | 1001 / 67 | 1350 / 120 |
| USD per letter | n/a | $0.00170 | $0.00035 | n/a |
| Errors | 0 | 0 | 0 | 0 |

Right next step, paired with Jev (exact McNemar, two-sided): keyword: only Jev right 14, only keyword right 2, p = 0.004; haiku: only Jev right 0, only haiku right 3, p = 0.250; gemini: only Jev right 1, only gemini right 2, p = 1.000.

## Per reason (precision / recall, 95% Wilson)

| Reason | Support | keyword | haiku | gemini | jev |
|---|---|---|---|---|---|
| residency | 17 | P 60% (6/10, 31%-83%)<br>R 35% (6/17, 17%-59%) | P 83% (15/18, 61%-94%)<br>R 88% (15/17, 66%-97%) | P 100% (6/6, 61%-100%)<br>R 35% (6/17, 17%-59%) | P 100% (10/10, 72%-100%)<br>R 59% (10/17, 36%-78%) |
| therapy_participation | 9 | P 88% (7/8, 53%-98%)<br>R 78% (7/9, 45%-94%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) |
| no_improvement | 13 | P 60% (3/5, 23%-88%)<br>R 23% (3/13, 8%-50%) | P 86% (12/14, 60%-96%)<br>R 92% (12/13, 67%-99%) | P 76% (13/17, 53%-90%)<br>R 100% (13/13, 77%-100%) | P 76% (13/17, 53%-90%)<br>R 100% (13/13, 77%-100%) |
| custodial_substitute | 21 | P 67% (12/18, 44%-84%)<br>R 57% (12/21, 37%-76%) | P 75% (21/28, 57%-87%)<br>R 100% (21/21, 85%-100%) | P 78% (21/27, 59%-89%)<br>R 100% (21/21, 85%-100%) | P 74% (20/27, 55%-87%)<br>R 95% (20/21, 77%-99%) |
| no_daily_skilled_need | 16 | P 75% (3/4, 30%-95%)<br>R 19% (3/16, 7%-43%) | P 75% (15/20, 53%-89%)<br>R 94% (15/16, 72%-99%) | P 62% (16/26, 43%-78%)<br>R 100% (16/16, 81%-100%) | P 53% (16/30, 36%-70%)<br>R 100% (16/16, 81%-100%) |
| missing_documentation | 8 | P 73% (8/11, 43%-90%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) | P 89% (8/9, 56%-98%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) |

## Threshold sweep (dev only)

| Engine | Threshold | Right next step | Caught | Wrongly contested | To a person |
|---|---|---|---|---|---|
| haiku | 0.3 | 95% | 100% | 0% | 15% |
| haiku | 0.4 | 100% | 100% | 0% | 15% |
| haiku | 0.5 | 100% | 100% | 0% | 15% |
| haiku | 0.6 | 100% | 100% | 0% | 15% |
| haiku | 0.7 | 100% | 100% | 0% | 15% |
| gemini | 0.3 | 95% | 100% | 3% | 10% |
| gemini | 0.4 | 95% | 100% | 3% | 10% |
| gemini | 0.5 | 95% | 100% | 3% | 10% |
| gemini | 0.6 | 95% | 100% | 3% | 10% |
| gemini | 0.7 | 95% | 100% | 3% | 10% |
| jev | 0.3 | 88% | 97% | 9% | 48% |
| jev | 0.4 | 90% | 97% | 6% | 48% |
| jev | 0.5 | 93% | 97% | 6% | 48% |
| jev | 0.6 | 93% | 97% | 6% | 48% |
| jev | 0.7 | 95% | 97% | 3% | 48% |
