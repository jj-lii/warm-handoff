# Eval: golden

Synthetic letters. Gold = author's blind labels. Threshold 0.5. rules.ts d4898e11f76c. 2026-10-05T00:23:05.986Z
Items: 40 labelled of 40 (0 marked unsure).
Generator intent matches blind labels exactly: 45% (18/40, 31%-60%).
Gold is adjudicated (3 letters corrected). Blind labels match it: reasons 93% (37/40, 80%-97%); next step 100% (40/40, 91%-100%).

## Headline

| Metric | keyword | haiku | gemini | jev |
|---|---|---|---|---|
| Precision, top of queue | 82% (top 10) | 88% (top 10) | 87% (top 10) | 100% (top 10) |
| Right next step | 70% (28/40, 55%-82%) | 90% (36/40, 77%-96%) | 90% (36/40, 77%-96%) | 90% (36/40, 77%-96%) |
| Contestable denials caught | 85% (23/27, 68%-94%) | 100% (27/27, 88%-100%) | 100% (27/27, 88%-100%) | 100% (27/27, 88%-100%) |
| Wrongly contested | 18% (5/28, 8%-36%) | 13% (4/31, 5%-29%) | 13% (4/31, 5%-29%) | 13% (4/31, 5%-29%) |
| Sent to a person | 18% (7/40, 9%-32%) | 13% (5/40, 5%-26%) | 13% (5/40, 5%-26%) | 48% (19/40, 33%-63%) |
| Reason set matches labels | 13% (5/40, 5%-26%) | 48% (19/40, 33%-63%) | 63% (25/40, 47%-76%) | 53% (21/40, 37%-67%) |
| Right next step, hard cases | 40% (4/10, 17%-69%) | 100% (10/10, 72%-100%) | 90% (9/10, 60%-98%) | 90% (9/10, 60%-98%) |
| Right next step, excl. unsure | 70% (28/40, 55%-82%) | 90% (36/40, 77%-96%) | 90% (36/40, 77%-96%) | 90% (36/40, 77%-96%) |
| Brier (mean over labels) | n/a | 0.093 | 0.108 | 0.088 |
| Latency p50 / p90 | 0 / 0 ms | 1091 / 1591 ms | 730 / 886 ms | 137 / 210 ms |
| Tokens in / out per letter | n/a | 1396 / 64 | 1015 / 67 | 1366 / 120 |
| USD per letter | n/a | $0.00172 | $0.00035 | n/a |
| Errors | 0 | 0 | 0 | 0 |

Right next step, paired with Jev (exact McNemar, two-sided): keyword: only Jev right 9, only keyword right 1, p = 0.021; haiku: only Jev right 1, only haiku right 1, p = 1.000; gemini: only Jev right 0, only gemini right 0, p = 1.000.

## Per reason (precision / recall, 95% Wilson)

| Reason | Support | keyword | haiku | gemini | jev |
|---|---|---|---|---|---|
| residency | 8 | P 23% (3/13, 8%-50%)<br>R 38% (3/8, 14%-69%) | P 44% (8/18, 25%-66%)<br>R 100% (8/8, 68%-100%) | P 100% (3/3, 44%-100%)<br>R 38% (3/8, 14%-69%) | P 67% (6/9, 35%-88%)<br>R 75% (6/8, 41%-93%) |
| therapy_participation | 9 | P 75% (6/8, 41%-93%)<br>R 67% (6/9, 35%-88%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) |
| no_improvement | 15 | P 60% (3/5, 23%-88%)<br>R 20% (3/15, 7%-45%) | P 88% (15/17, 66%-97%)<br>R 100% (15/15, 80%-100%) | P 83% (15/18, 61%-94%)<br>R 100% (15/15, 80%-100%) | P 75% (15/20, 53%-89%)<br>R 100% (15/15, 80%-100%) |
| custodial_substitute | 19 | P 67% (14/21, 45%-83%)<br>R 74% (14/19, 51%-88%) | P 68% (19/28, 49%-82%)<br>R 100% (19/19, 83%-100%) | P 68% (19/28, 49%-82%)<br>R 100% (19/19, 83%-100%) | P 73% (19/26, 54%-86%)<br>R 100% (19/19, 83%-100%) |
| no_daily_skilled_need | 19 | P 50% (1/2, 9%-91%)<br>R 5% (1/19, 1%-25%) | P 73% (19/26, 54%-86%)<br>R 100% (19/19, 83%-100%) | P 68% (19/28, 49%-82%)<br>R 100% (19/19, 83%-100%) | P 63% (19/30, 46%-78%)<br>R 100% (19/19, 83%-100%) |
| missing_documentation | 8 | P 89% (8/9, 56%-98%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) |
