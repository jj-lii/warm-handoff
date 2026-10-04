// Denial-reason taxonomy and the Medicare rules each reason is checked against.
// Quotes are verbatim from the Medicare Benefit Policy Manual, Chapter 8
// (https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/bp102c08pdf.pdf),
// a US government work. The taxonomy comes from the reasoning OIG reported in
// OEI-09-24-00331 (see research/external/oig-2026-snf-prior-auth-denials.md).

export const LABELS = [
  "residency",
  "therapy_participation",
  "no_improvement",
  "custodial_substitute",
  "no_daily_skilled_need",
  "missing_documentation",
] as const;

export type Label = (typeof LABELS)[number];

// What the coordinator should do about a reason, in order of precedence.
// rules_conflict: the stated reason is not a coverage criterion; contest on the rules.
// clinical_dispute: a legitimate criterion; contest only with chart evidence.
// fixable: nothing to argue; send what is missing.
export type Action = "rules_conflict" | "clinical_dispute" | "fixable";

export type Citation = {
  source: string; // e.g. "Medicare Benefit Policy Manual, Ch. 8, §30.6"
  quote?: string; // verbatim; omitted when we cite a section by title only
};

export type Rule = {
  label: Label;
  title: string;
  action: Action;
  // Sent to Jev. Must stand alone: question IDs are not sent to the model.
  question: string;
  criteria: { true: string; false: string };
  // Keyword baseline for evals. Deliberately simple: it is the bar Jev has to clear.
  keywords: RegExp[];
  argument: string; // one-paragraph rebuttal or next step, written for the draft
  citations: Citation[];
};

const CH8 = "Medicare Benefit Policy Manual, Ch. 8";

export const RULES: Record<Label, Rule> = {
  residency: {
    label: "residency",
    title: "Denied because the person lives in a nursing home",
    action: "rules_conflict",
    question:
      "Does the denial give the member's status as a long-term or custodial nursing home resident (where they live, or that they already live in a nursing facility) as a reason for denying the skilled stay?",
    criteria: {
      true: "Living in a nursing facility, being a long-stay or custodial resident, or the reasons the member lives there are offered as grounds for the denial.",
      false:
        "Residence is not offered as a reason. Merely naming the facility, addressing the member as a resident, or describing their history does not count.",
    },
    keywords: [/\b(long[- ]?(stay|term) (care )?resident|resides in|lives in|custodial resident|place of residence|reasons? (the )?(member|enrollee|patient) lives)\b/i],
    argument:
      "Where the member lives is not a coverage criterion. Chapter 8 sets out four factors (a need for skilled services, on a daily basis, that as a practical matter can only be provided in a SNF, and that are reasonable and necessary); residence is not among them. Since 2024, Medicare Advantage plans must apply Traditional Medicare's coverage criteria, including these SNF criteria.",
    citations: [
      { source: `${CH8}, §30`, quote: "Care in a SNF is covered if all of the following four factors are met" },
      // Cited by title: read from the CMS fact sheet, not the rule text (research/external/cms-2023-ma-coverage-criteria-rule.md).
      { source: "CMS-4201-F (Contract Year 2024 MA and Part D Final Rule)" },
    ],
  },
  therapy_participation: {
    label: "therapy_participation",
    title: "Denied because the member can't take part in daily therapy",
    action: "rules_conflict",
    question:
      "Does the denial argue that the member cannot, will not, or is unlikely to participate in or tolerate daily skilled therapy (for example because of cognition, dementia, endurance or baseline function)?",
    criteria: {
      true: "The member's ability, willingness or tolerance to take part in therapy is offered as a reason for denial.",
      false: "Therapy participation or tolerance is not given as a reason.",
    },
    keywords: [/\b(participat\w*|tolerat\w*|unable to engage|cognitive (status|impairment)|dementia)\b.*\btherap/i, /\btherap\w*\b.*\b(participat\w*|tolerat\w*)\b/i],
    argument:
      "The SNF benefit covers daily skilled nursing, not only therapy. Chapter 8's first factor is a need for \"skilled nursing services or skilled rehabilitation services\", and the daily requirement is met by skilled nursing on essentially a 7-days-a-week basis. Whether the member can take part in therapy does not decide coverage when daily skilled nursing is needed, and a diagnosis or prognosis should never be the sole factor in deciding a service is not skilled.",
    citations: [
      {
        source: `${CH8}, §30`,
        quote: "The patient requires skilled nursing services or skilled rehabilitation services",
      },
      {
        source: `${CH8}, §30.6`,
        quote:
          "Skilled nursing services or skilled rehabilitation services (or a combination of these services) must be needed and provided on a \"daily basis,\" i.e., on essentially a 7-days-a-week basis.",
      },
      {
        source: `${CH8}, §30.2.2`,
        quote: "a patient's diagnosis or prognosis should never be the sole factor in deciding that a service is not skilled.",
      },
    ],
  },
  no_improvement: {
    label: "no_improvement",
    title: "Denied for lack of improvement potential",
    action: "rules_conflict",
    question:
      "Does the denial cite a lack of potential for improvement, a plateau, no expected functional gains, or that care would only maintain the member's condition?",
    criteria: {
      true: "Improvement potential, progress, plateau or 'maintenance only' is offered as a reason for denial.",
      false: "Improvement or maintenance is not given as a reason.",
    },
    keywords: [/\b(plateau\w*|potential for (improvement|recovery)|restorative potential|no (further |significant )?(functional )?(gains|progress|improvement)|maintenance (only|level|care))\b/i],
    argument:
      "Coverage does not depend on whether the member will improve. Chapter 8, as revised after the Jimmo v. Sebelius settlement, says skilled care is covered to maintain the current condition or to prevent or slow deterioration, and that coverage turns on the need for skilled care, not on improvement potential.",
    citations: [
      {
        source: `${CH8}, §30`,
        quote:
          "Coverage of nursing care and/or therapy to perform a maintenance program does not turn on the presence or absence of an individual's potential for improvement from the nursing care and/or therapy, but rather on the beneficiary's need for skilled care.",
      },
      {
        source: `${CH8}, §30.2.1`,
        quote:
          "Skilled care may be necessary to improve a patient's current condition, to maintain the patient's current condition, or to prevent or slow further deterioration of the patient's condition.",
      },
    ],
  },
  custodial_substitute: {
    label: "custodial_substitute",
    title: "Denied because current or custodial care is said to be enough",
    action: "rules_conflict",
    question:
      "Does the denial say the member's needs can be met at their current custodial or long-term care level, with intermittent or as-needed skilled support, or at a lower level of care, instead of a skilled stay?",
    criteria: {
      true: "The denial offers the member's existing custodial care, intermittent therapy or nursing supports, or a lower level of care as a substitute for the skilled stay.",
      false: "No substitute level of care or existing support is offered as a reason.",
    },
    keywords: [/\b(intermittent|as[- ]needed|custodial (level|care)|lower level of care|current level of care|already (has|have|receiv\w+)|existing (supports?|services)|long[- ]term care (level|setting))\b/i],
    argument:
      "If the member needs skilled services daily, intermittent or custodial support does not meet that need: Chapter 8 contrasts intermittent with daily skilled care. Whether care can be given elsewhere is judged on the member's condition and on whether the alternative would adversely affect it, not on what support already happens to be available.",
    citations: [
      {
        source: `${CH8}, §30`,
        quote: "payment for a SNF level of care could not be made if a patient needs an intermittent rather than daily skilled service.",
      },
      {
        source: `${CH8}, §30.7`,
        quote:
          "If the use of those alternatives would adversely affect the patient's medical condition, the A/B MAC (A) concludes that as a practical matter the daily skilled services can only be provided by a SNF on an inpatient basis.",
      },
    ],
  },
  no_daily_skilled_need: {
    label: "no_daily_skilled_need",
    title: "Denied because no daily skilled need was found",
    action: "clinical_dispute",
    question:
      "Does the denial state that the member does not need skilled nursing or skilled therapy services on a daily basis, or that their needs are not skilled?",
    criteria: {
      true: "The denial makes a clinical finding that skilled services are not needed, or not needed daily.",
      false: "The denial does not claim the member's needs are unskilled or less than daily.",
    },
    keywords: [/\b(not (require|need)\w* (daily )?skilled|no (daily )?skilled (need|services)|does not meet (skilled|SNF) (level|criteria)|non-?skilled|not daily)\b/i],
    argument:
      "This is a clinical claim, and it is a legitimate criterion. Contest it only with chart evidence: list each skilled service, who must perform it, and how often. Observation and assessment, and management of a care plan, can themselves be skilled services.",
    citations: [
      {
        source: `${CH8}, §30.6`,
        quote:
          "Skilled nursing services or skilled rehabilitation services (or a combination of these services) must be needed and provided on a \"daily basis,\" i.e., on essentially a 7-days-a-week basis.",
      },
      { source: `${CH8}, §30.2.3.1 (Management and Evaluation of a Patient Care Plan)` },
      { source: `${CH8}, §30.2.3.2 (Observation and Assessment of Patient's Condition)` },
    ],
  },
  missing_documentation: {
    label: "missing_documentation",
    title: "Denied for missing or insufficient documentation",
    action: "fixable",
    question:
      "Does the denial say that clinical information or documentation was missing, incomplete, insufficient or not received?",
    criteria: {
      true: "The plan says it lacked information or documents needed to decide.",
      false: "The plan does not say anything was missing; it reviewed the information and decided on the merits.",
    },
    keywords: [/\b(insufficient|incomplete|missing|not (been )?(received|provided|submitted)|unable to (determine|verify)|additional (clinical )?(information|documentation))\b/i],
    argument:
      "Nothing here to argue. Send what the plan says is missing (physician orders, nursing and therapy notes documenting each skilled service and its frequency) and resubmit before considering an appeal.",
    citations: [{ source: `${CH8}, §30.2.2.1 (Documentation to Support Skilled Care Determinations)` }],
  },
};

export const ACTION_ORDER: Action[] = ["rules_conflict", "clinical_dispute", "fixable"];
