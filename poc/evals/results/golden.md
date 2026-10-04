# Eval: golden

Synthetic letters. Gold = author's blind labels. Threshold 0.5. rules.ts 507021cafa41. 2026-10-04T23:36:28.341Z
Items: 40 labelled of 40 (0 marked unsure).
Generator intent matches blind labels exactly: 45% (18/40, 31%-60%).

## Headline

| Metric | keyword | haiku | jev |
|---|---|---|---|
| Precision, top of queue | 82% (top 10) | 88% (top 10) | 100% (top 10) |
| Right next step | 70% (28/40, 55%-82%) | 90% (36/40, 77%-96%) | 90% (36/40, 77%-96%) |
| Contestable denials caught | 85% (23/27, 68%-94%) | 100% (27/27, 88%-100%) | 100% (27/27, 88%-100%) |
| Wrongly contested | 18% (5/28, 8%-36%) | 13% (4/31, 5%-29%) | 13% (4/31, 5%-29%) |
| Sent to a person | 18% (7/40, 9%-32%) | 13% (5/40, 5%-26%) | 48% (19/40, 33%-63%) |
| Reason set matches labels | 13% (5/40, 5%-26%) | 43% (17/40, 29%-58%) | 45% (18/40, 31%-60%) |
| Right next step, hard cases | 40% (4/10, 17%-69%) | 100% (10/10, 72%-100%) | 90% (9/10, 60%-98%) |
| Right next step, excl. unsure | 70% (28/40, 55%-82%) | 90% (36/40, 77%-96%) | 90% (36/40, 77%-96%) |
| Brier (mean over labels) | n/a | 0.100 | 0.103 |
| Latency p50 / p90 | 0 / 0 ms | 1091 / 1591 ms | 137 / 210 ms |
| Tokens in / out per letter | n/a | 1396 / 64 | 1366 / 120 |
| USD per letter | n/a | $0.00172 | n/a |
| Errors | 0 | 0 | 0 |

## Per reason (precision / recall, 95% Wilson)

| Reason | Support | keyword | haiku | jev |
|---|---|---|---|---|
| residency | 9 | P 23% (3/13, 8%-50%)<br>R 33% (3/9, 12%-65%) | P 50% (9/18, 29%-71%)<br>R 100% (9/9, 70%-100%) | P 67% (6/9, 35%-88%)<br>R 67% (6/9, 35%-88%) |
| therapy_participation | 9 | P 75% (6/8, 41%-93%)<br>R 67% (6/9, 35%-88%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) |
| no_improvement | 15 | P 60% (3/5, 23%-88%)<br>R 20% (3/15, 7%-45%) | P 88% (15/17, 66%-97%)<br>R 100% (15/15, 80%-100%) | P 75% (15/20, 53%-89%)<br>R 100% (15/15, 80%-100%) |
| custodial_substitute | 17 | P 57% (12/21, 37%-76%)<br>R 71% (12/17, 47%-87%) | P 61% (17/28, 42%-76%)<br>R 100% (17/17, 82%-100%) | P 65% (17/26, 46%-81%)<br>R 100% (17/17, 82%-100%) |
| no_daily_skilled_need | 18 | P 50% (1/2, 9%-91%)<br>R 6% (1/18, 1%-26%) | P 69% (18/26, 50%-83%)<br>R 100% (18/18, 82%-100%) | P 60% (18/30, 42%-75%)<br>R 100% (18/18, 82%-100%) |
| missing_documentation | 8 | P 89% (8/9, 56%-98%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) |
