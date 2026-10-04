# Spike: Medicare Appeals Council SNF decisions as real eval data

- Citation: HHS Departmental Appeals Board, Medicare Appeals Council decisions (SNF list), https://www.hhs.gov/about/agencies/dab/decisions/council-decisions/index.html. 25 PDFs saved by hand by the author on 2026-10-04 and read locally; inventory in `research/sources/dab/index.md` (private).
- Year: 2007-2014
- Tier: 1 (government adjudication)
- Question: could real adjudicated denials replace author-written labels as the held-out test set (the Goodhart problem in the plan)?
- Findings:
  - 32 decisions: the 25 on the SNF list, plus 7 from the author's site search for "SNF" (46 results; the other 39 were already held or only mention SNFs in passing). Signed 2007-02-15 to 2014-02-21. Only 1 is after the January 2014 manual revision that followed the Jimmo settlement (M-12-1140); the two 2014 search hits are about supplies and ambulance destinations.
  - 14 are squarely about SNF level of care, 9 partly, 9 not at all (Part B glucose testing, notices, home health, ambulance, a dismissal).
  - 7 are Medicare Advantage (Part C), 6 of them about SNF coverage, including two Evercare cases (UnitedHealthcare's nursing-home plan) involving daily skilled nursing.
  - Beneficiaries appear by initials; names, Medicare numbers and dates of service sit in an unpublished attachment. HHS content is public domain.
- Verdict: no-go as a test set. It is below the 10-case "partial" bar for post-2014 decisions, and outcomes before 2013 were decided under the improvement standard, so they can't label a Jimmo-based check.
- Use instead: a real-language smoke slice (about 14-23 cases, 6 of them MA, reasons labelled blind, reported separately, outcomes not used as labels) and reference phrasing for synthetic cases.
- Limits: the index may list only selected decisions (V28). Later Part C appeals are decided by the IRE and ALJs, whose decisions aren't published here (V29).
- Relevance: public adjudicated data is too thin and too old to validate this check; a real eval needs a pilot on a customer's own denial letters. That is a deck point, not a gap to hide.
