# Problem statement: long-stay residents denied short-term skilled care

**Long-stay nursing home residents on Medicare Advantage who need a short-term skilled stay are denied about four times as often as other enrollees. The stated reasoning conflicts with Medicare's own coverage rules, and the case falls into a workflow built for hospital referrals.**

Sources and tiers: [T1] government · [T2] independent policy research · [co.] company-reported · *hypothesis* = ours, untested. Figures map to `research/evidence.md`; open checks to `docs/verify.md`.

## Who has it
- **The resident:** someone who has lived in the nursing home for 100+ days, on custodial (usually Medicaid-funded) care, whose condition changes (after a hospital stay or in place) so that they now need daily skilled nursing or rehab.
- **The facility's managed care team:** the people who must request and defend a skilled stay with the resident's MA plan, for a patient already in their own building.

## The evidence
- **The gap [T1].** In June 2024, 19 MA organizations denied **39.5%** of SNF requests for long-stay residents (1,283 of 3,248) against **11.5%** for other enrollees. Residents were about 3% of requests. OIG did not break down reasons, called the gap "nearly four times the rate", and recommended CMS examine it. That recommendation is open (OIG OEI-09-24-00331).
- **Denials in this setting are usually wrong when challenged, and rarely challenged [T1].** Across all SNF admission denials, only 18% were appealed and 95% of those were overturned (same report). Residents' own appeal rates were not reported.
- **The reasoning [T1, as reported by OIG].** Insurers said residents "already have some intermittent skilled therapy supports available". One contractor's reviewer guidance (naviHealth) said to "consider the reasons that the enrollee lives in a nursing facility", which "frequently impact a patient's ability to meaningfully participate in daily skilled therapy". It denied residents at a higher rate than other reviewers.
- **The conflict with Medicare's rules [T1].**
  - The SNF benefit covers daily skilled *nursing*, not only therapy (Medicare Benefit Policy Manual Ch. 8, §30, §30.6).
  - Coverage "does not turn on the presence or absence of an individual's potential for improvement … but rather on the beneficiary's need for skilled care" (Ch. 8, §30; the *Jimmo* settlement).
  - Since 2024, MA plans must apply Traditional Medicare's SNF criteria (CMS-4201-F).
  - Advocates and the nursing home industry told OIG that residence "should not affect" eligibility and that custodial care with intermittent therapy "is not a clinically equivalent substitute".
- **The workflow gap [co., help articles; V17].** ExaCare's Managed Care Agent starts from a referral, and the Residents tab lists people who arrived as accepted referrals. A resident's change in condition has no starting point except creating a "referral" by Quick Upload, with a hospital as source, and an exported chart as the "admissions package". The PointClickCare link pushes data *into* the EHR at admission, and the push requires the source hospital's NPI and phone (`kb/push-to-pcc.md`, `kb/pcc-faq.md`).

## What it costs
- **The resident:** a denied skilled stay means staying on custodial care that, per the industry and advocates above, is not clinically equivalent, or a transfer elsewhere.
- **The facility:** either it delivers skilled-level care at the custodial rate, or it absorbs the staff time of an appeal it has little tooling for. *The dollar gap per denied stay is not yet sourced* (V21).
- **The system:** OIG's broader finding (95% of appealed SNF denials overturned) suggests a share of these denials are wrong and stand only because nobody appeals.

## What people ask for vs the underlying problem
Operators ask for faster, less manual prior auth and appeals. Our hypothesis is that, for residents, the problem is not speed. It is that **the request is framed for a hospital transfer, so reviewers judge a resident against the wrong picture.** A request built around daily skilled *nursing* need and maintenance coverage, with the change in condition documented from the facility's own chart, answers the stated objection before it is made.

## Hypotheses to test
1. *Hypothesis:* most resident denials cite residency, therapy participation or lack of improvement, rather than missing documentation. Test: classify real or realistic denial reasons against Ch. 8.
2. *Hypothesis:* requests framed on Ch. 8 (daily skilled nursing, maintenance) are denied less often.
3. *Hypothesis:* some facilities stop requesting skilled stays for MA residents at all because they expect denial, so the 3,248 requests understate the need.

## What we are deliberately not solving
- General appeals drafting or end-of-stay notices for all patients (on ExaCare's announced roadmap).
- Hospital referrals, intake speed, Traditional Medicare or Medicaid authorizations.
- Contesting every denial: some residents genuinely don't need daily skilled care.
- Legal determinations: outputs are drafts for a clinician and compliance reviewer.
- Real EHR integration or real patient data: the prototype uses synthetic residents (ADR 0004) and real public documents only (Ch. 8, plans' published SNF policies).
- Plans built specifically for nursing home residents (I-SNPs) until V18 is checked.

## How we'd know it worked (pilot measures)
- Denial rate for resident skilled-stay requests, before vs after.
- Share of denials whose stated reason conflicts with Ch. 8, and how many of those are appealed and overturned.
- Time from documented change in condition to submitted request.
