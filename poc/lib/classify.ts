// Classifies a denial's stated reasons. Two engines behind one interface so the
// evals and the API compare like with like.
import { askNouls, type NoulQuestion } from "./jev";
import { LABELS, RULES, type Label } from "./rules";

export type Engine = "jev" | "baseline";

// Default decision threshold; chosen from the eval threshold sweep (evals/results/).
export const THRESHOLD = 0.5;
// Probabilities inside this band are surfaced for human review instead of trusted.
export const REVIEW_BAND: [number, number] = [0.3, 0.7];

export type Classification = {
  engine: Engine;
  model: string;
  probabilities: Record<Label, number>;
  usage?: { input_tokens: number; output_tokens: number };
  latency_ms: number;
};

export const CONTEXT =
  "A Medicare Advantage plan's letter denying a request for a short-term skilled nursing facility (SNF) stay for a member who is a long-stay nursing home resident. Judge only the reasons the plan gives for its decision.";

function questions(): Record<Label, NoulQuestion> {
  return Object.fromEntries(
    LABELS.map((l) => [
      l,
      {
        type: "noul",
        instructions: `${RULES[l].question} Read \`denial.text\`.`,
        criteria: RULES[l].criteria,
      },
    ]),
  ) as Record<Label, NoulQuestion>;
}

export async function classify(text: string, engine: Engine): Promise<Classification> {
  const start = performance.now();
  if (engine === "baseline") {
    const probabilities = Object.fromEntries(
      LABELS.map((l) => [l, RULES[l].keywords.some((k) => k.test(text)) ? 1 : 0]),
    ) as Record<Label, number>;
    return { engine, model: "keyword-baseline", probabilities, latency_ms: Math.round(performance.now() - start) };
  }

  // One request, six independent Nouls over the same state: a denial can give several reasons.
  const res = await askNouls({ context: CONTEXT, denial: { text } }, questions());
  const probabilities = Object.fromEntries(LABELS.map((l) => [l, res.answers[l].noul])) as Record<Label, number>;
  return {
    engine,
    model: res.model,
    probabilities,
    usage: res.usage,
    latency_ms: Math.round(performance.now() - start),
  };
}

export function detected(probabilities: Record<Label, number>, threshold = THRESHOLD): Label[] {
  return LABELS.filter((l) => probabilities[l] >= threshold);
}
