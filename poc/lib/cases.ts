// Demo cases: synthetic denial letters from evals/data/dev.jsonl (ADR 0022) plus
// invented chart facts and dates. Synthetic data only; no real patient information.
// Names are basketball players; no teams appear.

export type ChartFact = { id: string; text: string; source: string };

export type Case = {
  id: string; // the dev letter id, e.g. "dev-001"
  member: { name: string };
  plan: string;
  facility: string;
  denial: { date: string }; // ISO date
  chart_facts: ChartFact[];
};

// MA reconsideration window from the denial notice (42 CFR 422.582; V34).
export const APPEAL_WINDOW_DAYS = 65;

type Seed = Omit<Case, "denial" | "chart_facts"> & { denied_days_ago: number; facts: [string, string][] };

// The queue: 12 dev letters covering every next step, including the two custodial
// ambiguity letters (dev-008, dev-009) and one Jev miss (dev-023).
const SEEDS: Seed[] = [
  {
    id: "dev-001", member: { name: "Kawhi Leonard" }, plan: "Maple Crest Advantage (HMO)", facility: "Lakeshore Care Centre", denied_days_ago: 60,
    facts: [
      ["Open reduction and internal fixation, left hip, after a fall; partial weight-bearing ordered", "Hospital discharge summary"],
      ["Physical therapy 60 min daily, 6 days a week: gait training and transfers, therapist-led", "PT evaluation"],
      ["Surgical incision assessed and dressed daily by a licensed nurse", "Treatment record"],
    ],
  },
  {
    id: "dev-002", member: { name: "Chris Bosh" }, plan: "Summit Ridge Advantage HMO-POS", facility: "Riverside Manor", denied_days_ago: 30,
    facts: [
      ["Left-sided weakness after an ischemic stroke; transfers went from supervision to two-person assist", "Hospital discharge summary"],
      ["Occupational therapy daily for upper-limb retraining; goal is independent feeding", "OT plan of care"],
    ],
  },
  {
    id: "dev-003", member: { name: "Fred VanVleet" }, plan: "Maple Crest Advantage (HMO)", facility: "Cedar Hollow Health Center", denied_days_ago: 62,
    facts: [
      ["IV ceftriaxone daily for 14 days for pneumonia, through a PICC line", "Physician order"],
      ["PICC line care and IV administration by a licensed nurse each day", "MAR"],
    ],
  },
  {
    id: "dev-004", member: { name: "DeMar DeRozan" }, plan: "Maple Crest Advantage (HMO)", facility: "Riverside Manor", denied_days_ago: 45,
    facts: [
      ["Stage 3 sacral pressure injury; negative-pressure wound therapy with dressing changes every other day", "Wound care note"],
      ["Daily skilled assessment of the wound and nutrition by a licensed nurse", "Nursing care plan"],
    ],
  },
  {
    id: "dev-005", member: { name: "Klay Thompson" }, plan: "Summit Ridge Advantage HMO-POS", facility: "Lakeshore Care Centre", denied_days_ago: 20,
    facts: [
      ["Below-knee amputation, right,; prosthetic training planned", "Hospital discharge summary"],
      ["PT and OT daily for transfers and residual-limb care", "Therapy plan of care"],
    ],
  },
  {
    id: "dev-008", member: { name: "Ray Allen" }, plan: "Summit Ridge Advantage HMO-POS", facility: "Riverside Manor", denied_days_ago: 59,
    facts: [
      ["New insulin regimen after hyperosmolar episode; sliding-scale doses adjusted daily by the physician", "Physician order"],
      ["Blood glucose checks four times a day with licensed-nurse assessment and teaching", "MAR"],
    ],
  },
  {
    id: "dev-009", member: { name: "Dirk Nowitzki" }, plan: "Harborview Medicare Plus", facility: "Birchwood Nursing and Rehabilitation", denied_days_ago: 50,
    facts: [
      ["New PEG tube after dysphagia from pneumonia; tube feeding started", "Hospital discharge summary"],
      ["Speech-language pathology daily for swallow retraining", "SLP evaluation"],
      ["Tube-site care and feeding tolerance assessed by a licensed nurse daily", "Nursing care plan"],
    ],
  },
  {
    id: "dev-012", member: { name: "Kevin Garnett" }, plan: "Summit Ridge Advantage HMO-POS", facility: "Lakeshore Care Centre", denied_days_ago: 15,
    facts: [["Heart failure exacerbation; daily weights and IV diuretic adjustment", "Physician order"]],
  },
  {
    id: "dev-018", member: { name: "Stephen Curry" }, plan: "Maple Crest Advantage (HMO)", facility: "Lakeshore Care Centre", denied_days_ago: 40,
    facts: [
      ["Compression fracture, T12, after a fall; pain limits mobility", "Hospital discharge summary"],
      ["Daily PT for mobility and fall prevention, therapist-led", "PT evaluation"],
    ],
  },
  {
    id: "dev-023", member: { name: "Steve Nash" }, plan: "Summit Ridge Advantage HMO-POS", facility: "Riverside Manor", denied_days_ago: 10,
    facts: [["COPD exacerbation; new oxygen titration and nebulizer treatments assessed daily", "Respiratory therapy note"]],
  },
  {
    id: "dev-035", member: { name: "Dwyane Wade" }, plan: "Summit Ridge Advantage HMO-POS", facility: "Cedar Hollow Health Center", denied_days_ago: 8,
    facts: [["Urosepsis treated in hospital; IV antibiotics to complete at the facility", "Hospital discharge summary"]],
  },
  {
    id: "dev-039", member: { name: "Pascal Siakam" }, plan: "Northline Senior Choice PPO", facility: "Birchwood Nursing and Rehabilitation", denied_days_ago: 61,
    facts: [
      ["Total knee replacement revision after prosthetic loosening", "Operative report"],
      ["PT twice daily for range of motion and gait; CPM machine set up by a therapist", "PT plan of care"],
    ],
  },
];

const DAY = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// Dates are relative to `today` so the demo's deadlines never go stale.
export function demoCases(today = new Date()): Case[] {
  return SEEDS.map(({ denied_days_ago, facts, ...rest }) => ({
    ...rest,
    denial: { date: isoDay(new Date(today.getTime() - denied_days_ago * DAY)) },
    chart_facts: facts.map(([text, source], i) => ({ id: `${rest.id}-f${i + 1}`, text, source })),
  }));
}

export function appealDeadline(kase: Pick<Case, "denial">): string {
  return isoDay(new Date(Date.parse(kase.denial.date) + APPEAL_WINDOW_DAYS * DAY));
}

export function daysLeft(kase: Pick<Case, "denial">, today = new Date()): number {
  return Math.ceil((Date.parse(appealDeadline(kase)) - Date.parse(isoDay(today))) / DAY);
}
