# Landscape: how a patient moves from hospital to skilled nursing, and where it breaks

A narrative of the post-acute admissions and reimbursement journey, built from the same sources as `research/problems.md`. It describes the problem space; it does not pick a problem.

**Tags:** [T1] government or peer-reviewed · [T2] independent policy research · [co.] company-reported by ExaCare · [op.] operator speaking at ExaCare's Summit · *background* = general domain knowledge not yet sourced in `research/external/`. Figures are mapped in `research/evidence.md`; open checks are in `docs/verify.md`.

---

## 1. The handoff: hospital to nursing facility

### Background: post-acute care
A hospital treats the acute problem (hip fracture, stroke, pneumonia). Once the patient is stable, the hospital wants to discharge: beds are scarce, and for most Medicare inpatients it is paid roughly a fixed amount per stay, so extra days cost it money (*background*). Many older patients still need daily nursing or therapy before they can go home. That middle stage is **post-acute care**, delivered in:
- **Skilled nursing facilities (SNFs):** the most common setting. A short-term rehab and medical wing inside a nursing home; a few weeks of nursing and therapy, then home. ExaCare's main customers.
- **Inpatient rehab facilities (IRFs):** intensive therapy, about three hours a day.
- **Long-term care hospitals (LTCHs):** very sick patients, e.g. on ventilators.
- **Home health and hospice.**

A SNF's short-term rehab patients are mostly paid for by Medicare; its long-term residents mostly by Medicaid. Same building, very different money (*background*).

### Who does the handoff
A hospital **discharge planner** (case manager or social worker) must find a facility that can handle the patient's needs, takes their insurance, has a bed now, and is acceptable to the patient or family.

### The referral and the packet
The planner sends a **referral to several SNFs at once**. The hospital is shopping; SNFs compete. The **packet** is a slice of the hospital record: physician and nursing notes, medications, therapy evaluations, labs, insurance. It is long and unstructured: 100 to 300 pages in operators' accounts [op.]. "You can't read 300 pages in 30 minutes" (Creative Solutions customer story) [op.].

Referrals travel through many channels: Epic CareLink, WellSky, Aidin, naviHealth, fax, phone, email. One operator received referrals from about **20 different systems** [op.]; ExaCare's research puts the typical operator at **3 to 5 portals** [co.].

### What a turnaround consists of
The turnaround is the time from referral arrival to the SNF's answer (yes, no, need more info). Following ExaCare's seven-step description (`blogPost/steps-in-the-snf-referral-process.md`) [co.]:
1. **Notice it arrived.** If nobody is watching that inbox, it sits. Pure dead time.
2. **Intake and triage.** Log it, check completeness (discharge summary, insurance, current medication list), judge urgency, route to a reviewer. Missing pieces are often found 25 minutes into clinical review.
3. **Clinical review.** The long step. Often the director of nursing, who is also running the floor, reads the packet: diagnoses, medications, wounds, therapy needs, behavioural history. Details are scattered; problems hide (a patient charted "no behaviors" who was on a sitter; a costly drug on page 73). 30 to 45+ minutes by hand [op./co.].
4. **Insurance and financial check** (alongside step 3). Payer, active coverage, prior-auth requirement, network status. Often portal-by-portal or phone. Checking before review wastes effort on patients you'll decline; checking after adds time.
5. **Bed and staffing check.** Often a whiteboard or a walk down the hall. In multi-facility companies, one building may decline while a sister building has the right bed.
6. **Decision.** Accept, decline, need more info. Facility-level or central intake. Many declines are for fixable reasons but get recorded as flat "no".
7. **Tell the hospital.** If slow, the planner has moved on.

**What ExaCare's "time-to-accept" measures:** referral received *in ExaCare* to accept *logged* by staff [co.]. It covers steps 2-6, counts accepts only (declines are timed separately), and in the benchmark includes only weekday working hours and decisions within 300 minutes.

**After "yes" (outside the turnaround):** the hospital picks among the yeses (ExaCare's "win rate" is accepted referrals that actually move in); prior authorization for Medicare Advantage patients (section 4); then the transfer itself (date, transport, room, admission paperwork).

**Where the time goes:** dead time, clinical review, insurance checks, by operators' and ExaCare's accounts. No independent time-and-motion studies were found.

---

## 2. The SNF's decision: should we take this patient?

### Background: why a SNF can't say yes to everyone
Each admission is a bet on three things:
1. **Clinical:** can we care for them safely? A patient the building can't handle is a clinical, regulatory and legal risk; SNFs are heavily inspected (*background*).
2. **Financial:** will we be paid enough to cover their care?
3. **Operational:** is there a bed on the right unit, and staff for this level of need?

### Clinical fit
Common flags: tracheostomy, ventilator, dialysis, IV lines, complex wounds; behavioural history (aggression, wandering, substance use, psychiatric diagnoses), which hospital charts often understate [co.]; required screens (e.g. a sex-offender registry check). Different buildings legitimately have different criteria. The **consistency problem** is when buildings with the *same* capabilities decide differently because reviewers weigh things differently [co.].

### Financial fit (simplified)
- **Traditional Medicare** pays a daily rate that rises with clinical complexity (**PDPM**). Short-term rehab patients are often the best-paying.
- **Medicare Advantage** pays negotiated contract rates, usually in levels (1-4), and requires prior authorization (section 4).
- **Medicaid** is generally the lowest payer (*background*).

Questions: is the plan **in-network**? Is the rate enough? Are there costly items, like an $800 medication, the plan won't pay for separately [op.]?

### What actually drives yes or no [T1]
JMIR 2023 (Strickland et al.; 627 SNFs, 2020-22):
- **Payer is among the strongest drivers.** Medicaid lowered acceptance by **67%**, managed care by **21.6%**; private insurance raised it by **13.7%**.
- **Diagnosis matters strongly.** Musculoskeletal patients were accepted most; mental illness least.
- **Occupancy and nursing hours had no significant effect.**
- Urban SNFs accepted less often than rural ones.

Facilities mostly say no because of who is paying and what the patient needs, not because they are full. Caveat: the period spans COVID.

### How facilities encode the decision: rules [co., help articles]
- **Red flag** fails, so the AI suggests **Reject**; **yellow flag** fails, so it suggests **Maybe** and a person must review; no flags, so **Accept**. Staff can override a rule outcome with a reason; history is kept.
- In ExaCare's Q1 2026 data, **under 30%** of referrals got a clear AI Accept or Reject; **70% came through as Maybe** [co.].
- One operator with **70 rules** and 80%+ Maybes trimmed them to its real criteria: **20x more AI Accepts**, **10% higher acceptance**, time-to-accept **22 to 18 minutes** [co.].
- The trade-off: loose rules are fast but risk taking patients the building can't handle; tight rules are safe but slow.

### What declines look like in aggregate [co./op.]
- **20% of one facility's clinical declines were for trach needs**, "a persistent source of leakage".
- **50% of "payer not accepted" declines were one insurer being out of network**: a contract problem, not an admissions problem.
- "I just didn't take five trachs for over thirty days, why?"
- Unanswered "yellow referrals": "a referral that goes out to die because the buildings don't respond."

Individual declines look reasonable; in aggregate they point to fixable gaps (a capability, a contract, a rule).

### Who decides: facility vs central intake
Facility-level (each building's admissions director or DON) or **central intake** (one team for many buildings, able to route to the best-fit sister building). ExaCare's customer stories credit centralization with much of the gain (Ignite: about $900K annual savings attributed to centralizing [co.]).

**Solid:** payer and diagnosis drive acceptance [T1]. **Company data:** the 70% Maybe, the rules case, decline examples. **Unknown:** how often declines are wrong, and what that costs.

---

## 3. The race: does speed really win?

### Background: why the hospital goes with the first yes
Discharge planners juggle many discharges; the hospital loses money on every extra day. When five SNFs get a referral, the first acceptable yes usually ends the search, though patient or family preference can override. ExaCare: "When one facility takes 38 minutes to respond and another responds in 10, the slower facility will not get a second chance on that patient" [co.].

### ExaCare's 2026 Time-to-Accept Benchmark [co.]
Published June 2026 (gated). 256,719 referrals, 981 facilities, Jan-Mar 2026, platform timestamps. Filters: weekdays and working hours; facilities on the platform 3+ months, 15+ admissions, more than 1 referral a day; accept decisions within 300 minutes. **Time-to-accept:** received in ExaCare to accept logged (facility median). **Win rate:** moved-in residents ÷ accepted referrals.

**Facilities vary widely.** Facility median time-to-accept by percentile (report p.6; matches the Summit slide):

| Percentile | 1% | 5% | 10% | 20% | 25% | 50% | 75% |
|---|---|---|---|---|---|---|---|
| Minutes | 4 | 8 | 11 | 14 | 17 | ~30 | 64 |

**The market is speeding up.** Among facilities with 6+ months on ExaCare, median referral-level time-to-accept fell from **33.8 minutes (Jul 2025) to 21.3 (May 2026)** (p.7). This is a cohort of users getting better with the tool, not necessarily the whole industry.

**Faster facilities convert more accepts.** Facilities answering in 7-8 minutes or less see win rates around **38%** (report; the slide's axis tops out near 30%). The steepest drop is between 10 and 15 minutes; after about 15-20 minutes, win rates flatten around 16-18%. By percentile: 11 min / 29.0%, 17 min / 23.6%, 30 min / 22.2%. Headline claims: "time-to-accept accounts for 70% of win rate performance"; "1 minute ≈ 1% higher win rate" (report) or "5 minutes, 7%" (slide).

**The money (illustrative).** 1% × 94 accepts a month ≈ 1 extra admission a month; × $565/day (Medicare) × 20 days ≈ **$125,000 a year per facility per minute saved**; a 10-facility operator going from 17 to 11 minutes, "more than $7.6M per year" [co.].

### Reading it critically
1. **Correlation, not causation.** Fast facilities may be better staffed, located or known; the "70%" figure has no stated method.
2. **Win rate leaves out referrals never accepted.** A facility accepting only easy patients could look fast and high-converting.
3. **Selection.** Active users only; the slow tail and off-hours referrals are excluded.
4. **Partly before-and-after with the product.** Other changes (centralization, staffing) may contribute.
5. **Figures shift between documents** (V13): top decile 7.5 min (p.4) vs 11 (p.6) vs 7.1 (blog); median drop "~34 to ~18" (p.4) vs 33.8 to 21.3 (p.7); 1 min ≈ 1% vs 5 min = 7%. Probably different measures; don't mix them.
6. **Revenue math assumes Medicare rates and a 20-day stay.**

### Outside evidence
- **No independent study found** testing "faster SNF response leads to more admissions."
- The hospital-side wait is well documented [T1] (section 6) but is attributed mainly to prior authorization and networks.
- Acceptance turns on payer and diagnosis [T1] (section 2).

One reconciliation: speed probably decides the contest *between facilities that would all say yes* to an easy, well-paying patient; it does little for patients nobody wants and nothing for insurer delays after the yes.

**Solid:** wide variation and a faster cohort, within ExaCare's data. **Soft:** how much speed causes wins; dollars per minute. **Unknown:** referrals lost to slowness vs fit vs insurance.

---

## 4. Who pays, and why prior authorization changed the job

### Two kinds of Medicare
**Traditional Medicare** (Part A for SNF stays):
- **No prior authorization**; the SNF's physician certifies need and the facility bills [co., prior-auth blog].
- Requires a qualifying inpatient hospital stay of 3+ days (the **3-day rule**) [co.].
- Paid under **PDPM**; audited after the fact.

**Medicare Advantage (MA)** (private insurers such as UnitedHealthcare, Humana, Aetna):
- About **half of Medicare beneficiaries** (KFF, as cited by ExaCare) [T2 via co.].
- **Prior authorization required** for a SNF stay; paid under each facility's contract with each plan.
- Prior auth went from edge case to default workflow [co.]. At Ignite, managed care is about **60%** of volume [op./co.].

### What prior authorization is
The insurer approving **this stay, at this level of care**, for an initial number of days. Distinct from insurance verification (coverage active?) and from Medicare certification (the SNF's own physician) [co.]. Submitted through Availity, naviHealth, plan portals or fax.

| Payer | Prior auth? | Typical wait [co.] |
|---|---|---|
| Traditional Medicare | No | — |
| Medicare Advantage | Yes | hours to several days |
| Medicaid managed care | Yes | days to weeks |
| Commercial insurance | Yes | hours to days |

**Federal floor [T1]** (CMS-0057-F, from 2026): decisions within **72 hours** (urgent) or **7 calendar days** (standard), with a **specific reason** for any denial.

### Why the level of care is where the money is
Contracts pay different daily rates by level (usually 1-4). **The level approved at admission sets the daily rate for the authorized period** [co.], and upgrading later is hard: plans "often won't convert it back … even if I'm trying to get that increased level the day after admission" [op., Managed Care in Action 07:18].

### What goes wrong
1. **Under-leveling.** Each contract's rubric runs "often dozens of pages"; under time pressure, staff request the level likely to clear fast, not the one the record supports [co.]. "Level one, level one, level one … the people that are processing the auth are lay people … they can't always build the story" [op.].
2. **Missed carve-outs.** Costly items can be paid separately only if negotiated before admission; miss it and an $800 medication puts you "upside down really fast" [op., 06:11].
3. **Hospital-initiated authorizations at a low level**, "to get patients through the door faster" [co., help article].
4. **Volume and fragmentation.** Many contracts, each with its own criteria, portal, levels and review rules [co.]; 100-150 page documents per patient across multiple portals [op., 10:42]; "very error prone" [co., Product Releases 16:27]; "Absolutely no one wants to do prior auth" [op.].

### What ExaCare has here (Managed Care Agent, shipped) [co.]
Reads the packet and uploaded contract; recommends a level with in-line citations; flags missing or stale documents; auto-submits through integrated portals or builds a fax package; tracks statuses and notifies. Ignite: processing time **22 to 10 minutes** per referral. Claims of higher average reimbursement have no published method (the "$380K a month" figure was dropped, V9).

**Solid [T1]:** Traditional Medicare needs no prior auth and MA does; the CMS timeframes and denial reasons. **Practitioner-consistent, not measured:** under-leveling, missed carve-outs, low hospital-initiated levels. **Unknown:** industry-wide revenue lost to under-leveling.

---

## 5. The denial, and the appeal gap

### Background
A plan can approve, partly approve (fewer days or a lower level), or deny. The patient, or the facility on their behalf, can **appeal**: first to the plan, then to independent reviewers (*background*). A facility doctor can request a **peer-to-peer** call with the plan's reviewer, "often the fastest path to overturning a denial when the clinical case is strong" [co.]. Some plans use contractors; the one named in federal data is **naviHealth** (Optum, UnitedHealth).

### OIG 2026 [T1, author-confirmed (V7)]
OEI-09-24-00331 (June 2026): all SNF admission prior-auth requests at **19 MA insurers, June 2024**.

| Finding | Number |
|---|---|
| SNF admission requests denied | **12%** |
| Range across insurers | **0.4% to 23%** |
| Denials appealed | **18%** |
| Appealed denials overturned | **95%** |
| Nursing home residents seeking a short-term SNF stay, denied | **40%** (vs 11%) |
| naviHealth: denial rate / overturned on appeal | **14% / 97%** (insurers' own reviews: 11%) |
| UnitedHealth, Humana, CVS share of SNF requests | about three-quarters |

OIG: the overturn rate "indicates that some enrollees were initially denied medically necessary care." Three recommendations to CMS (fix initial reviews, explain the variation, examine the nursing-home-resident gap), all open.

### Context [T2, KFF 2026]
| Setting | Denied | Appealed | Overturned |
|---|---|---|---|
| LTCHs | 65% | 36% | 36% |
| IRFs | 54% | 31% | 43% |
| **SNFs** | **12%** | **18%** | **95%** |
| All MA prior auths | under 8% | — | — |

(KFF's SNF figures restate OIG.) SNF denials are not the biggest category, but they are the most often wrong when challenged, and the least often challenged.

### The arithmetic
Per 1,000 SNF requests: about **120 denied**, about **22 appealed**, about **21 overturned**, about **98 never appealed**. If unappealed denials were as weak as appealed ones (a big if), most of those 98 would be wrongful denials that stood. That is an inference, not an OIG finding.

### Why so few appeals: unmeasured (hypotheses)
- **Time:** the patient needs a bed now, so they go elsewhere.
- **Effort:** the same clinical evidence-gathering and writing as prior auth.
- **Ownership:** the patient appeals, the hospital wants to discharge, the SNF hasn't admitted yet but holds the evidence.
- **Selection:** facilities may appeal only strong cases, so 95% would overstate the rest.

### The nursing home resident gap
Long-term residents (usually Medicaid) seeking short-term skilled care are denied at **40%**, nearly 4x others. OIG flags it without explanation; one unconfirmed possibility is that reviewers judge frail-at-baseline residents as not needing skilled care beyond what they already get.

### What operators say [op.]
Late non-coverage notices ("seven o'clock on Saturday", Managed Care in Action 02:53). A panel moderator's illustrative "declined ten, appealed all ten, won all ten" is a hypothetical, not data (V10).

### What's changing [T1]
From 2026: specific denial reasons; 72-hour / 7-day decisions. From 2027: Prior Authorization API and public reporting of plans' prior-auth metrics. MedPAC said in 2025 it had not yet analysed MA utilization-management data (search summary only).

### What ExaCare has [co.]
**Shipped:** "Denied" and "Peer-to-Peer" statuses, notifications, comments on status changes (help articles). **Announced:** "Notices of Medicare Non-Coverage and appeals", "this quarter" (2026-08-13). **Not visible:** appeal drafting or appeal-deadline tracking.

**Solid [T1]:** the OIG figures; but one month and admissions only. **Unknown:** why appeals are rare; patient outcomes after unappealed denials.

---

## 6. The cost of waiting: the hospital side

### Background
Hospitals are paid roughly per stay; a medically ready patient waiting for a SNF bed costs money and blocks a bed. For older patients, extra acute days mean lost strength and mobility (*background*).

### JAMA Internal Medicine 2025 [T1]
McGarry, Wilcock, Gandhi, Grabowski, Barnett. 89.3M admissions, 2017 to Sep 2023, Medicare claims; difference-in-differences.

| | Traditional Medicare | Medicare Advantage |
|---|---|---|
| Average stay, 2017 | 5.8 days | 6.0 days |
| Average stay, 2023 | 6.3 days | 7.1 days |

- By Q3 2023, MA admissions were **1.2 pp more likely to last 14+ days** (19.5% relative increase).
- For patients discharged to a SNF: **3.1 pp more likely** to stay 14+ days.
- About **1.8 million extra bed-days** in 2022.
- Authors: prior authorization and narrower post-acute networks are "plausible explanations."

**Caveats:** observational; spans COVID; doesn't measure why each patient waited. A trade-press "$5.5 billion" hospital cost figure is unverified; don't use it.

### How it connects
Referral out (1), SNF review in minutes (2-3), SNF declines that restart the search (2), prior auth in hours to days (4), denial and appeal for days more (5). **SNF review is minutes; insurer steps can be days.** SNF speed decides which SNF wins, but is probably not the main reason patients are stuck.

### Who bears the cost
Hospitals (unpaid bed-days, hence low-level authorizations to move patients); patients (extended acute stays); SNFs (stalled referrals, empty beds); MA plans arguably save when stays are shorter or avoided, which is the incentive regulators are examining.

---

## 7. After admission: keeping the stay covered

### Background
Traditional Medicare covers up to 100 days per benefit period while skilled need continues (*background*). **MA approves an initial block of days** and requires re-justification throughout. MA stays tend to be short: "usually discharged somewhere between twelve to fifteen days" [op., Payer Perspective 14:04].

### Concurrent reviews
"Prior auths help get the right level of reimbursement at time of admission, whereas concurrent reviews help defend that reimbursement level throughout the patient's entire stay" [co., Product Releases 19:17]. Why they are hard [co./op.]:
- **Every plan has a different clock:** every 3 days or 5+; before the weekend or Monday; a day ahead or that morning.
- **Tracked by hand:** spreadsheets, stale reports, "one person's inbox and memory."
- **Uneven load:** "everybody could have ten patients but somebody could have twenty updates" [op., 03:27].
- **The justification:** 30-60 minutes per patient by hand [co.], from evidence split across the EHR and therapy notes.
- **Framing:** payers want skilled services delivered and progress toward prior function, not a list of deficits [co.].
- **Changing needs:** if the level doesn't keep pace, "the facility delivers more care than it's being paid for"; new drugs may need carve-outs [co.].

### When the plan stops paying: the NOMNC
The patient must receive a **Notice of Medicare Non-Coverage** shortly before coverage ends and can request a fast independent appeal (*background*). Operators: notices arriving "seven o'clock on Saturday … later and later in the day" [op., 02:53], compressing the window into the weekend. **OIG's figures cover admissions only;** there is no comparable federal data on end-of-stay denials in this research.

### Discharge and after
- Payers judge facilities on post-discharge outcomes. One operator found a plan measuring readmissions over 30 days for patients who leave in 12-15, and rebuilt its home-health referral network around agencies with lower rehospitalization rates [op., 14:04].
- **Additional Document Requests (ADRs):** after-the-fact documentation requests and recoupments; ExaCare lists ADRs as upcoming [co.].

### What ExaCare has [co.]
**Shipped (Concurrent Reviews, 2026-08-13):** live list of active authorizations with next review dates from payer approvals; an editable, auto-drafted justification of about two pages; flags for higher-level eligibility, undelivered contracted therapy minutes and new carve-outs; packet assembly and submission by portal or eFax; clinician review before sending. NHCA: 750 justifications across 42 facilities and 450 patients in 3 weeks; now 100+ a day. **Announced:** NOMNCs and appeals, ACO/IPA updates, ADRs, deeper EHR therapy data.

**Unknown:** how often continued-stay reviews or NOMNCs end coverage too early, and appeal and overturn rates for them.

---

## 8. Where the technology is (ExaCare, published material)

"Not visible" means not in the material read, not that it doesn't exist.

| Stage | Shipped | Announced or vision | Not visible |
|---|---|---|---|
| Referral arrives | One inbox across 10 platforms, 100+ Epic CareLink variants, AI fax triage | — | — |
| Clinical review | AI packet review; red/yellow rules; Accept/Maybe/Reject; override with reasons | Autonomous admissions | — |
| Financial check | Eligibility check, PDPM estimate, high-cost drug flags | — | — |
| Capacity | Bed board and census (PointClickCare sync) | — | — |
| Response and analytics | Response-time dashboards; decline and lost reasons; AI-vs-staff alignment; benchmarks; AI assistant | — | Rule-change proposals; dollar value of recurring declines |
| Prior auth | Managed Care Agent: level with citations, contract reading, document flags, auto-submit, status tracking | — | — |
| Denial | Denied / Peer-to-Peer statuses, notifications, comments | Appeals ("this quarter") | Appeal drafting and deadline tracking |
| During the stay | Concurrent Reviews | NOMNCs, ACO/IPA updates, ADRs, deeper therapy data | — |
| Paperwork | eSign | — | — |
| After discharge | Home health and hospice (intake side) | Coordination platform: outbound referrals, provider discovery, discharge packets, chat | — |

ExaCare started at the front door (intake and review) and is moving down the journey (prior auth, then concurrent reviews; appeals, NOMNCs and discharge coordination announced). Hospital-side referral portals (WellSky, Aidin, naviHealth) feed into it; naviHealth is also an MA review contractor. ExaCare positions itself against PointClickCare's Referral Advisor; competitors were not researched further.

---

## 9. Tensions

1. **Speed vs fit.** "First clear answer wins" [co.] vs acceptance driven by payer and diagnosis [T1]. Speed likely decides between facilities that would all say yes.
2. **Where the delay is.** SNF review takes minutes and is shrinking; insurer steps take days and are where JAMA's authors point.
3. **Loose vs tight rules.** 70% Maybe is safe but slow; loosening raised acceptance by 10% in one case [co.], with clinical risk unreported.
4. **Modest denials, unchallenged errors.** 12% denied, but 95% of appealed denials overturned and only 18% appealed.
5. **Hospital vs SNF incentives.** Hospitals push for speed, sometimes at a lower authorized level; SNFs need the level that pays for the care.
6. **Plan incentives.** Shorter or avoided stays can benefit plans; OIG's findings and new CMS rules shift scrutiny to initial reviews.
7. **Who owns the appeal.** The patient appeals, the hospital wants discharge, the SNF holds the evidence before admission. Nobody clearly owns it.
8. **Company data vs independent evidence.** The richest SNF-operations data is a vendor's own; independent data covers insurers (OIG) and hospitals (JAMA).

---

## 10. What nobody seems to measure

- Why facilities don't appeal denials (time, effort, the patient is gone, or selective appeals).
- What happens to patients after an unappealed denial.
- End-of-stay denials: NOMNC and continued-stay denial, appeal and overturn rates.
- How often authorized levels fall below what the record supports, and the cost.
- Lost referrals by cause: speed vs clinical fit vs insurance vs beds.
- Whether speed causes wins, or travels with other advantages.
- Wrong declines: patients a facility could have served, and where they went.
- Why long-term nursing home residents are denied short-term skilled care at 40%.
