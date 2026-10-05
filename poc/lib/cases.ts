// Demo cases: synthetic denial letters from evals/data/dev.jsonl plus invented chart
// facts and dates. Synthetic data only; no real patient information.

export type ChartFact = { id: string; text: string; source: string };

export type Case = {
  id: string; // the dev letter id, e.g. "dev-001"
  member: { name: string };
  plan: string;
  denial: { date: string }; // ISO date
  chart_facts: ChartFact[];
};
