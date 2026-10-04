# Problem shortlist

## Method
- **Internal:** six bulk summaries of all 57 scraped pages and 10 of the 12 Summit transcripts (AI Tools for Executives and the highlight reel were skipped). Every figure and quote below was then checked by hand against the source line; two summary errors were caught and dropped. Transcripts are auto-captions (V6).
- **External:** 5 notes in `research/external/`: OIG 2026, CMS-0057-F and JAMA IM 2025 (tier 1); KFF 2026 (tier 2, mostly restating OIG); JMIR 2023 (tier 1, abstract only). US sources only.
- **Weighting:** tier 1 sets whether a problem is real and how large it is; tier 4 (ExaCare, company-reported) shows where operators feel it and what ExaCare already covers. A problem with only tier 4 support ranks lower.
- **Scope:** shortlist only. The author picks the problem.

---

## 1. Medicare Advantage SNF denials that are wrong but rarely appealed
**Problem and who has it.** When an MA plan denies a SNF admission or continued stay, the facility has to decide whether to appeal and then build the case quickly. This falls on SNF case managers and managed-care teams, and on patients waiting in hospital beds.

**Evidence**
- External (tier 1, OIG 2026): 12% of SNF admission requests denied (0.4% to 23% by MAO); only 18% of denials appealed; 95% of appealed denials overturned; nursing home residents denied at 40% vs 11%. `research/external/oig-2026-snf-prior-auth-denials.md`
- External (tier 1, CMS-0057-F, 2024): from 2026, payers must give "a specific reason" for each denial. A structured reason is something a tool can act on. `research/external/cms-2024-prior-auth-final-rule.md`
- External (tier 1, JAMA IM 2025): MA patients discharged to a SNF were 3.1 pp more likely to have 14+ day hospital stays; the authors call prior auth a "plausible" cause. `research/external/jama-2025-ma-extended-hospital-stays.md`
- Internal (tier 4): the payer-panel moderator frames a "you declined ten, I appealed all ten" exchange as a hypothetical, "kind of a waste of time on both sides" (`summit-transcripts/payer-perspective-v2.md` 26:26-27:02; not data); NOMNCs arrive late, e.g. on a Saturday evening (`managed-care-in-action-v2.md` 02:53).

**What ExaCare already does (published).** The Managed Care Agent handles prior auth and, since 2026-08-13, Concurrent Reviews. The launch post names "Notices of Medicare Non-Coverage and appeals" as what it is building "this quarter" (`blogPost/introducing-concurrent-reviews.md`).

**Gap hypothesis (hypothesis).** The low appeal rate set against the 95% overturn rate suggests the cost of appealing, not the merits, decides whether a facility appeals. A tool that reads the denial reason, pulls supporting evidence from the record, drafts the appeal and tracks the deadline could make appealing the default. This overlaps ExaCare's stated roadmap: the prototype would be a take on a direction ExaCare has already named, not an unclaimed gap.

**POC feasibility: 4/5.** A synthetic denial letter, a synthetic chart excerpt and a payer rubric lead to a drafted appeal with citations and a deadline. One model call on fake documents demos well. It loses a point because appeal rules vary by payer and level.

**Risks and what would change our mind.** The data is one month (June 2024). Appeals may stay rare for reasons a draft can't fix (the patient goes elsewhere, the stay ends). Evidence that facilities skip appeals by choice, not because of the effort, would weaken the case. ExaCare may ship this before the deck is shown.

**Confidence: high** that the problem is real (tier 1); **medium** that drafting effort is the bottleneck.

---

## 2. Under-leveled authorizations and missed carve-outs before admission
**Problem and who has it.** Intake staff, often not clinicians, request the safest level of care rather than the one the record supports, and can miss high-cost drug carve-outs. Both are hard to fix after admission. This falls on SNF managed-care and intake teams and on operator margin.

**Evidence**
- Internal (tier 4): "some of those plans that they just level one, level one, level one ... the people that are processing the off are lay people" (`managed-care-in-action-v2.md` 07:18); missing a carve-out or the highest level "sometimes can't be fixed after admission", with an $800 medication example (06:11); packets of 100-150 pages per case across several portals (10:42); work is "very air [error] prone" because rules vary by payer, region and level (`product-releases-v2.md` 16:27); the blog describes requesting "the safe-and-fast level rather than the clinically supported one" (`blogPost/prior-authorization-snf-admissions.md` l.90, l.102).
- Internal (tier 4, company-reported results): Ignite managed-care processing went from 22 to 10 minutes per referral (`customerStory/ignite-medical-resorts.md` l.127); "over $380K in monthly reimbursement revenue uplift per facility" from internal data (`blogPost/prior-authorization-snf-admissions.md` l.27).
- External: **thin.** Tier 1 sources show MA plans use prior auth to manage admissions (MedPAC Mar 2025, Ch. 6, search result only, no note written) but nothing measures under-leveling. No outside evidence found.

**What ExaCare already does (published).** This is the Managed Care Agent's core claim: contract interpretation, extraction, level selection and submission.

**Gap hypothesis (hypothesis).** Little visible gap. A possible angle is explaining the level choice to a non-clinical submitter ("why level 3, which lines support it"), but no published material shows that's missing.

**POC feasibility: 4/5.** A synthetic packet plus a synthetic payer level rubric lead to a recommended level with cited evidence and carve-out flags. It is easy to build, but it would mostly rebuild a shipped feature.

**Risks and what would change our mind.** Competing directly with a shipped feature; the evidence is all tier 4. An independent study of level-of-care accuracy would move this up.

**Confidence: medium** (strong practitioner signal, no outside evidence).

---

## 3. Referral declines that recur but aren't acted on
**Problem and who has it.** Operators decline the same kinds of referrals repeatedly (a clinical capability gap, an out-of-network payer) without turning the pattern into a decision: train staff, add a capability, renegotiate a contract or stop listing in a hospital's portal. This falls on regional ops, business development and DONs.

**Evidence**
- Internal (tier 4): "twenty percent of the clinical declines were actually driven by trach needs ... a persistent source of leakage" (`turning-data-into-advantage-v2.md` 14:08); "fifty percent of payers not accepted ... were due to Humana being out of network" (13:03); "I just didn't take five trachs for over thirty days, why?" (`how-leading-snfs-wins-referals-v2.md` 20:51); "yellow referrals ... a referral that goes out to die because the buildings don't respond" (15:47); trimming 70 accept rules gave "twenty times more AI accepts" and a ten percent increase in accept rates (`turning-data-into-advantage-v2.md` 16:24).
- External (tier 1, JMIR 2023, 627 SNFs): diagnosis and payer drive acceptance. Medicaid cuts acceptance by 67.0% and managed care by 21.6%; occupancy and nursing hours had no significant effect. `research/external/jmir-2023-snf-admission-decisions.md`

**What ExaCare already does (published).** Portfolio analytics show decline reasons, payer mix and response times (`blogPost/post-acute-software-2026.md` l.82, l.166), with cuts by hospital source for contract talks (Data talk 13:03).

**Gap hypothesis (hypothesis).** ExaCare shows *why* referrals were declined; a next step is *what it's worth to fix*: size each recurring decline pattern (lost days and revenue at a synthetic rate) and rank the fixes (contract, capability, rules). The talks show that analysis being done by hand in conversation.

**POC feasibility: 5/5.** A synthetic referral log CSV feeds a decline-pattern sizing and ranked-actions view. It needs no model call, is fully deterministic and is easy to demo honestly.

**Risks and what would change our mind.** It may already exist inside the Data Center (the talks show some of it). Revenue sizing needs assumed reimbursement rates, which must be labeled as assumptions. If operators can't change contracts or capabilities quickly, ranking the fixes has little value.

**Confidence: medium.**

---

## 4. Slow referral response loses the patient
**Problem and who has it.** Hospitals send one referral to several SNFs; the first acceptable answer often wins. Long packets slow clinical review. This falls on admissions directors and DONs.

**Evidence**
- Internal (tier 4): market time-to-accept fell "from thirty minutes to twenty one minutes" over 12 months on ExaCare facilities (`turning-data-into-advantage-v2.md` 05:07); top 10% of ~825 facilities decide in 7.1 minutes (`blogPost/steps-in-the-snf-referral-process.md` l.26); a 24-48 hour turnaround before ExaCare and "You can't read 300 pages in 30 minutes" (`customerStory/creative-solutions-in-healthcare.md` l.39, l.90); benchmark of 256,719 referrals across 981 facilities, gated (`insightsPost/time-to-accept-benchmark-report.md` l.19, V3).
- External: JAMA IM 2025 shows long MA waits for SNF placement (the hospital side); JMIR 2023 shows payer and diagnosis, not operational load, drive accept/deny. **No outside source found that ties SNF response speed to win rate.** The speed-wins premise rests on company data (V3).

**What ExaCare already does (published).** This is the core product: portal consolidation, AI packet screening, prioritization and benchmarks.

**Gap hypothesis (hypothesis).** None visible from public material.

**POC feasibility: 3/5.** A packet summarizer on synthetic packets is easy, but it duplicates the core product and is hard to show as better.

**Risks.** It competes with the company's core strength; the evidence is tier 4 only.

**Confidence: high** that the pain exists for operators; **low** that a prototype adds anything.

---

## Recommendation
Lead with **#1 (MA denials and appeals)**: it has the strongest tier 1 evidence (OIG's 18% appealed vs 95% overturned), a clear user and a demoable POC. Frame it as building on a direction ExaCare has published, not filling a hole. **#3** is the fallback: weaker outside evidence, but the most honest and lowest-risk POC.

**Drop #4:** it is ExaCare's core and the outside evidence doesn't test the speed premise. **Drop #2 unless the author finds outside evidence:** it duplicates a shipped feature and the support is all tier 4.

**Where outside evidence qualifies ExaCare's framing:** the prior-auth blog treats MA prior auth as the dominant intake workload, but OIG puts SNF denial rates at 12%, much lower than for IRF and LTCH. The pain is mostly in level, effort and appeals, not outright refusal. JMIR also suggests acceptance turns on payer and diagnosis more than speed.

## Open questions for the author
1. Is a prototype on ExaCare's announced roadmap (#1) stronger or weaker than one on an unclaimed angle (#3)?
2. Should #1 cover admission denials only, or NOMNC/continued-stay denials too? OIG data covers admission only.
3. Is it worth one more search pass for outside evidence on under-leveling (#2) or speed vs win rate (#4)?
