# Eval: dev

Synthetic letters. Gold = author's blind labels. Threshold 0.5. rules.ts b6fc6ea5e889. 2026-10-04T22:54:20.541Z
Items: 40 labelled of 40 (0 marked unsure).
Generator intent matches blind labels exactly: 38% (15/40, 24%-53%).

## Headline

| Metric | keyword | haiku | jev |
|---|---|---|---|
| Precision, top of queue | 84% (top 10) | 97% (top 10) | 100% (top 10) |
| Right next step | 63% (25/40, 47%-76%) | 93% (37/40, 80%-97%) | 93% (37/40, 80%-97%) |
| Contestable denials caught | 70% (21/30, 52%-83%) | 100% (30/30, 89%-100%) | 97% (29/30, 83%-99%) |
| Wrongly contested | 16% (4/25, 6%-35%) | 9% (3/33, 3%-24%) | 6% (2/31, 2%-21%) |
| Sent to a person | 25% (10/40, 14%-40%) | 15% (6/40, 7%-29%) | 53% (21/40, 37%-67%) |
| Reason set matches labels | 10% (4/40, 4%-23%) | 48% (19/40, 33%-63%) | 43% (17/40, 29%-58%) |
| Right next step, hard cases | 60% (6/10, 31%-83%) | 90% (9/10, 60%-98%) | 90% (9/10, 60%-98%) |
| Right next step, excl. unsure | 63% (25/40, 47%-76%) | 93% (37/40, 80%-97%) | 93% (37/40, 80%-97%) |
| Brier (mean over labels) | n/a | 0.115 | 0.116 |
| Latency p50 / p90 | 0 / 0 ms | 1413 / 3097 ms | 193 / 314 ms |
| Tokens in / out per letter | n/a | 1287 / 65 | 1259 / 120 |
| USD per letter | n/a | $0.00161 | n/a |
| Errors | 0 | 0 | 0 |

## Per reason (precision / recall, 95% Wilson)

| Reason | Support | keyword | haiku | jev |
|---|---|---|---|---|
| residency | 17 | P 60% (6/10, 31%-83%)<br>R 35% (6/17, 17%-59%) | P 59% (16/27, 41%-75%)<br>R 94% (16/17, 73%-99%) | P 70% (16/23, 49%-84%)<br>R 94% (16/17, 73%-99%) |
| therapy_participation | 9 | P 88% (7/8, 53%-98%)<br>R 78% (7/9, 45%-94%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) | P 100% (9/9, 70%-100%)<br>R 100% (9/9, 70%-100%) |
| no_improvement | 13 | P 60% (3/5, 23%-88%)<br>R 23% (3/13, 8%-50%) | P 86% (12/14, 60%-96%)<br>R 92% (12/13, 67%-99%) | P 76% (13/17, 53%-90%)<br>R 100% (13/13, 77%-100%) |
| custodial_substitute | 21 | P 67% (12/18, 44%-84%)<br>R 57% (12/21, 37%-76%) | P 68% (21/31, 50%-81%)<br>R 100% (21/21, 85%-100%) | P 74% (20/27, 55%-87%)<br>R 95% (20/21, 77%-99%) |
| no_daily_skilled_need | 16 | P 75% (3/4, 30%-95%)<br>R 19% (3/16, 7%-43%) | P 60% (15/25, 41%-77%)<br>R 94% (15/16, 72%-99%) | P 53% (16/30, 36%-70%)<br>R 100% (16/16, 81%-100%) |
| missing_documentation | 8 | P 73% (8/11, 43%-90%)<br>R 100% (8/8, 68%-100%) | P 100% (8/8, 68%-100%)<br>R 100% (8/8, 68%-100%) | P 80% (8/10, 49%-94%)<br>R 100% (8/8, 68%-100%) |

## Threshold sweep (dev only)

| Engine | Threshold | Right next step | Caught | Wrongly contested | To a person |
|---|---|---|---|---|---|
| haiku | 0.3 | 93% | 100% | 9% | 15% |
| haiku | 0.4 | 93% | 100% | 9% | 15% |
| haiku | 0.5 | 93% | 100% | 9% | 15% |
| haiku | 0.6 | 93% | 100% | 9% | 15% |
| haiku | 0.7 | 93% | 100% | 9% | 15% |
| jev | 0.3 | 88% | 100% | 12% | 53% |
| jev | 0.4 | 93% | 100% | 6% | 53% |
| jev | 0.5 | 93% | 97% | 6% | 53% |
| jev | 0.6 | 93% | 97% | 6% | 53% |
| jev | 0.7 | 95% | 97% | 3% | 53% |
