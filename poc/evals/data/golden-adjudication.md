# Golden set adjudication

Version 1, 2026-10-04. Synthetic letters only.

Compares Gemini's intended reasons (`intent` in `golden.jsonl`) with the author's blind labels (`labels/golden.jsonl`) on the 22 of 40 letters where they differ. Rulings use the yes/no criteria in `lib/rules.ts` and were written before any engine was run on golden. Claude proposes; the author decides. Status for each row: proposed / accepted / rejected.

Residency rows follow the known limitation in `BRIEF.md`: there's no rule for when a stated long-stay status counts as a reason, so the author's label stands.

| Letter | Intent | Blind label | Ruling | Reason | Status |
|---|---|---|---|---|---|
| golden-005 | R+T | R+T+I | Keep label | "fails to establish ... endurance required to actively participate in and realistically benefit from" leans toward therapy participation, but "benefit" supports improvement too. Borderline. | proposed |
| golden-007 | C | R+N | **Change to C+N** | The only relevant sentence offers "the support services you already receive within your existing long-term care setting, combined with periodic nursing" as the substitute: a custodial-substitute reason, not residency. Looks like a slip (keys 1 and 4). N stands: "do not require daily, high-intensity skilled nursing". | proposed |
| golden-010 | I+C | I+C+N | Keep label | "The member's care does not necessitate daily skilled inpatient therapy." | proposed |
| golden-011 | C | C+N | Keep label | "the requested level of inpatient skilled care is not clinically substantiated." | proposed |
| golden-012 | R+T+C | T+I+C+N | Keep label | I: "derive meaningful functional benefit" (borderline, as golden-005). N: "not medically necessary" after a daily-skilled analysis. R not labelled: limitation. | proposed |
| golden-013 | R+C | C+N | Keep label | N: "do not necessitate continuous daily skilled management". R not labelled: limitation. | proposed |
| golden-014 | N | C+N | Keep label | "can be safely and adequately provided under custodial care protocols." | proposed |
| golden-015 | N (distractor I) | C+N | Keep label | "provided on a non-daily or routine care basis within the resident's ongoing custodial setting." | proposed |
| golden-018 | R+C | C+N | Keep label | N: "do not demonstrate a severity of illness requiring an inpatient" skilled stay. R not labelled: limitation. | proposed |
| golden-020 | C+M | C+N+M | Keep label | "does not substantiate skilled nursing or intensive rehabilitation requirements". | proposed |
| golden-022 | N | C+N | Keep label | "can be ... rendered within your ongoing custodial setting". | proposed |
| golden-028 | T+N | T+I+C+N | Keep label | I: "would not derive measurable functional benefit". C: "administered under custodial care through restorative nursing and certified nursing aides". | proposed |
| golden-029 | I | R+I | Keep label | R from a background mention ("you have resided at the facility under long-stay custodial care"): limitation. | proposed |
| golden-030 | T | R+T+I | Keep label | I: "achieve meaningful, measurable improvement". R from a background mention: limitation. | proposed |
| golden-031 | R+T+C | R+T+I+N | **Change to R+T+I+C+N** | C missed: "can be adequately and appropriately delivered through the facility's existing custodial" care. I: "A meaningful functional recovery ... cannot be realistically projected". N: "rather than an acute post-hospital event requiring a skilled level of care". | proposed |
| golden-033 | R+I | R+I+C | Keep label | "need for ... skilled nursing or rehabilitation services above the level of routine custodial support" implies custodial support suffices. Borderline. | proposed |
| golden-034 | R | R+C | Keep label | "fall within routine custodial scope". | proposed |
| golden-035 | T | T+I+C+N | Keep label | I: "limited rehabilitative potential". C: "appropriate for ongoing long-term custodial management". N: "do not mandate daily skilled therapy services". | proposed |
| golden-036 | I | I+C | Keep label | "Continued care is appropriately managed at the custodial level of care." | proposed |
| golden-037 | R+T | R+T+C | Keep label | "these care needs can be managed through custodial service[s]". | proposed |
| golden-039 | N | C+N | Keep label | "can be safely rendered at a custodial level". | proposed |
| golden-040 | R (distractor M) | R+C | **Change to R+C+N** | C stands: "Care needs can be safely managed under the member's existing custodial baseline." N missed: services "reflect custodial care rather than continuous skilled nursing or daily skilled therapy interventions". M correctly unlabelled: the letter says the decision "is not predicated on absent or insufficient medical documentation". | proposed |

Key: R residency, T therapy participation, I no improvement, C custodial substitute, N no daily skilled need, M missing documentation.

Summary: 19 kept, 3 changes proposed. Gemini's intent is incomplete as gold: its letters routinely state reasons it wasn't asked for (custodial substitute +11 and no daily skilled need +9 over intent), which the blind labels caught.
