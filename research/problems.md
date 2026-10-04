# Problem shortlist

## Method
- **Internal:** six bulk summaries of all 57 scraped pages and 10 of the 12 Summit transcripts (AI Tools for Executives and the highlight reel were skipped). Every figure and quote below was then checked by hand against the source line; two summary errors were caught and dropped. Transcripts are auto-captions (V6).
- **Added in a second pass:** the full 2026 Time-to-Accept Benchmark Report (PDF, June 2026, obtained by the author through the public form); 21 help-centre articles on Managed Care Agent, screener and rules, insurance, PDPM and Data Center, saved by the author in a browser because robots.txt blocks bots; and 3 Summit slide screenshots. All are in `research/sources/` (private).
- **External:** 5 notes in `research/external/`: OIG 2026, CMS-0057-F, JAMA IM 2025 and JMIR 2023 (tier 1); KFF 2026 (tier 2, mostly restating OIG). OIG, CMS and JMIR figures were confirmed by the author (V7, V11, V12). US sources only.
- **Weighting:** tier 1 sets whether a problem is real and how large it is; tier 4 (ExaCare, company-reported) shows where operators feel it and what ExaCare already covers. Help articles are the most reliable record of what is *shipped*, as of each article's "last updated" date.
- **Scope:** shortlist only. The author picks the problem.

---

## 1. Medicare Advantage SNF denials that are wrong but rarely appealed
**Problem and who has it.** When an MA plan denies a SNF admission or continued stay, the facility has to decide whether to appeal and then build the case quickly. This falls on SNF case managers and managed-care teams, and on patients waiting in hospital beds.

**Evidence**
- External (tier 1, OIG 2026): 12% of SNF admission requests denied (0.4% to 23% by MAO); only 18% of denials appealed; 95% of appealed denials overturned; nursing home residents denied at 40% vs 11%. `research/external/oig-2026-snf-prior-auth-denials.md`
- External (tier 1, CMS-0057-F, 2024): from 2026, payers must give "a specific reason" for each denial. A structured reason is something a tool can act on. `research/external/cms-2024-prior-auth-final-rule.md`
- External (tier 1, JAMA IM 2025): MA patients discharged to a SNF were 3.1 pp more likely to have 14+ day hospital stays; the authors call prior auth a "plausible" cause. `research/external/jama-2025-ma-extended-hospital-stays.md`
- Internal (tier 4): NOMNCs arrive late, e.g. at 7 pm on a Saturday (`summit-transcripts/managed-care-in-action-v2.md` 02:53). The payer-panel "declined ten, appealed all ten" line is a moderator's hypothetical, not data (V10).

**What ExaCare already does (published).** The Managed Care Agent submits prior auths and syncs their statuses from payer portals; "Denied" and "Peer-to-Peer" are tracked statuses that can trigger a notification, and a comment can be added on any status change (`kb/5-review-auth.md`, updated ~3 months ago; `kb/2-configure-noti.md`). Concurrent Reviews shipped 2026-08-13. The launch post names "Notices of Medicare Non-Coverage and appeals" as what it is building "this quarter" (`blogPost/introducing-concurrent-reviews.md`). The help articles read show no appeal drafting or appeal-deadline tracking.

**Gap hypothesis (hypothesis).** The low appeal rate set against the 95% overturn rate suggests the cost of appealing, not the merits, decides whether a facility appeals. Today a denial ends as a status and a notification. A tool that reads the denial reason, pulls supporting evidence from the record, drafts the appeal or peer-to-peer brief and tracks the deadline could make appealing the default. This overlaps ExaCare's stated roadmap: the prototype would be a take on a direction ExaCare has already named, not an unclaimed gap.

**POC feasibility: 4/5.** A synthetic denial letter, a synthetic chart excerpt and a payer rubric lead to a drafted appeal with citations and a deadline. One model call on fake documents demos well. It loses a point because appeal rules vary by payer and level.

**Risks and what would change our mind.** The data is one month (June 2024). Appeals may stay rare for reasons a draft can't fix (the patient goes elsewhere, the stay ends). Evidence that facilities skip appeals by choice, not because of the effort, would weaken the case. ExaCare may ship this before the deck is shown (V8).

**Confidence: high** that the problem is real (tier 1); **medium** that drafting effort is the bottleneck.

---

## 2. Admission rules that send most referrals to manual review
**Problem and who has it.** Facilities configure accept/reject rules; any failed "yellow flag" rule makes the AI suggest "Maybe", which sends the referral to a person. When rules are too many, too strict or out of date, most referrals land in manual review and the speed benefit is lost. Recurring declines (a clinical capability, an out-of-network payer) are the same loop seen from the other end. This falls on admissions directors, DONs and regional ops.

**Evidence**
- Internal (tier 4, benchmark report p.11): "Less than 30% of referrals in this dataset received an AI suggestion of 'Accept' or 'Reject,' while the remaining 70% came through as 'Maybe'". One operator had over 80% "AI Maybe"; after a rules review: 20x more AI Accept suggestions, a 10% increase in acceptance rate, and TTA from 22 to 18 minutes. The same case is told on stage: "there were seventy rules" (`turning-data-into-advantage-v2.md` 16:24).
- Internal (tier 4): "twenty percent of the clinical declines were actually driven by trach needs ... a persistent source of leakage" (`turning-data-into-advantage-v2.md` 14:08); "fifty percent of payers not accepted ... were due to Humana being out of network" (13:03); "a referral that goes out to die because the buildings don't respond" (`how-leading-snfs-wins-referals-v2.md` 15:47).
- External (tier 1, JMIR 2023, 627 SNFs, confirmed V11): diagnosis and payer drive acceptance. Medicaid cuts acceptance by 67.0% and managed care by 21.6%; occupancy and nursing hours had no significant effect. So rules about payer and clinical fit, not capacity, are where decisions turn. `research/external/jmir-2023-snf-admission-decisions.md`

**What ExaCare already does (published).** Red and yellow flag rules drive Reject/Maybe suggestions (`kb/clinical-rules.md`). Staff can override a rule outcome with a reason, and the history is kept (`kb/rule-outcome-override.md`). An AI Suggestion Alignment report compares AI suggestions with staff decisions; Referral Trends shows top decline and lost reasons; an AI assistant answers questions over decline comments (`kb/dashboard.md`, `kb/ai.md`). The rules review in the case above appears to be done with ExaCare staff ("when we were able to work with the organization", 16:24).

**Gap hypothesis (hypothesis).** ExaCare already captures the signals (override reasons, alignment between AI and staff, decline reasons). A next step is turning them into **specific rule-change proposals**: "this yellow rule is overridden to Pass 85% of the time; loosening it would move N referrals per month from Maybe to Accept", plus the recurring decline patterns worth a contract or capability fix. That would make the rules review continuous and self-serve instead of an occasional exercise.

**POC feasibility: 5/5.** A synthetic rule set, a synthetic referral log with overrides and outcomes, and a ranked list of rule edits with expected impact. Deterministic, no model call needed, honest to demo.

**Risks and what would change our mind.** ExaCare may already do this inside its services or the Data Center (the help articles don't show it, but they cover features, not services). Loosening clinical rules carries clinical risk, so proposals must be framed as suggestions for a clinician to approve. Evidence is mostly tier 4.

**Confidence: medium.**

---

## 3. Slow referral response loses the patient
**Problem and who has it.** Hospitals send one referral to several SNFs; the first acceptable answer often wins. Long packets slow clinical review. This falls on admissions directors and DONs.

**Evidence**
- Internal (tier 4, benchmark report): 256,719 referrals across 981 facilities, Q1 2026, platform-logged timestamps; weekdays, working hours, accept decisions within 300 minutes only. Facility-level median TTA: 11 minutes at the 10th percentile, 17 at the 25th, 30 at the 50th. Among facilities with 6+ months on the platform, referral-level median TTA fell from 33.8 minutes (July 2025) to 21.3 (May 2026); the slide matches (`summit-screenshots/time-to-accept-drop.png`). "Win rate" is defined as moved-in residents divided by accepted referrals, and the report states "time-to-accept accounts for 70% of win rate performance" without giving the method.
- Internal (tier 4): "You can't read 300 pages in 30 minutes" (`customerStory/creative-solutions-in-healthcare.md` l.90).
- External: JAMA IM 2025 shows long MA waits for SNF placement (the hospital side); JMIR 2023 shows payer and diagnosis, not operational load, drive accept/deny. **No outside source found that ties SNF response speed to win rate.** The speed-wins premise rests on company data, which is correlational and filtered to active platform users.

**What ExaCare already does (published).** This is the core product: portal consolidation, AI packet screening, prioritization, response-time dashboards and benchmarks.

**Gap hypothesis (hypothesis).** None visible from public material.

**POC feasibility: 3/5.** A packet summarizer on synthetic packets is easy, but it duplicates the core product.

**Risks.** It competes with the company's core strength. The company's own speed figures vary between documents (V13).

**Confidence: high** that the pain exists for operators; **low** that a prototype adds anything.

---

## Dropped after the second pass: under-leveled authorizations
The first pass ranked this #2 (intake staff requesting "level one, level one, level one", `managed-care-in-action-v2.md` 07:18). The help articles show it's covered: Managed Care Agent "Determine[s] the appropriate level of care" with "justification with in-line citations", and tracks hospital-initiated auths submitted at a lower level (`kb/4-submit-preauth.md`, updated ~2 months ago). No outside evidence measures the problem either. A prototype would rebuild a shipped feature.

## Recommendation
Lead with **#1 (MA denials and appeals)**: the strongest tier 1 evidence (OIG's 18% appealed vs 95% overturned, confirmed), a gap the help articles support (a denial ends as a status), and a demoable POC. Frame it as building on a direction ExaCare has published, not filling a hole.

**#2 (rule tuning) is a close second** and the safer POC: deterministic, synthetic data fits naturally, and it builds on signals ExaCare already captures. Its outside evidence is weaker.

**Drop #3:** it is ExaCare's core and the outside evidence doesn't test the speed premise.

**Where outside evidence qualifies ExaCare's framing:**
- The prior-auth blog treats MA prior auth as the dominant intake workload, but OIG puts SNF denial rates at 12%, much lower than for IRF and LTCH. The pain is mostly in effort and appeals, not outright refusal.
- The benchmark ties speed to win rate, but it is correlational, and JMIR finds acceptance turns on payer and diagnosis, not on occupancy or staffing.

## Open questions for the author
1. Is a prototype on ExaCare's announced roadmap (#1) stronger or weaker than one that extends shipped features (#2)?
2. Should #1 cover admission denials only, or NOMNC/continued-stay denials too? OIG data covers admission only.
3. For #2: frame it as admissions efficiency (fewer Maybes) or as revenue (recurring declines worth fixing)?
