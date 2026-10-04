// Claude Haiku baseline (ADR 0015): the same context and six questions Jev gets,
// answered as six probabilities with structured output. Evals only.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CONTEXT, type Classification } from "../lib/classify";
import { LABELS, RULES, type Label } from "../lib/rules";

export const HAIKU_MODEL = process.env.HAIKU_MODEL ?? "claude-haiku-4-5";
// USD per million tokens, input / output. Anthropic list price for Claude Haiku 4.5
// (https://platform.claude.com/docs/en/about-claude/pricing), from the claude-api skill price table cached 2026-09-25. V30.
export const HAIKU_PRICE = { input: 1, output: 5 };

// Keys are the labels so the answer maps 1:1; no reasoning field, to match Jev's interface.
const Answer = z.object(Object.fromEntries(LABELS.map((l) => [l, z.number()])) as Record<Label, z.ZodNumber>);

// Exported so the cache key changes when the prompt does.
export const SYSTEM = `${CONTEXT}

Answer each question below with the probability (0 to 1) that the answer is yes. The questions are independent: a denial can give several reasons, or none of them.

${LABELS.map((l) => `${l}: ${RULES[l].question}\n  Yes: ${RULES[l].criteria.true}\n  No: ${RULES[l].criteria.false}`).join("\n\n")}`;

let client: Anthropic | undefined;

export async function classifyHaiku(text: string): Promise<Omit<Classification, "engine">> {
  client ??= new Anthropic();
  const start = performance.now();
  const res = await client.messages.parse({
    model: HAIKU_MODEL,
    max_tokens: 512,
    temperature: 0,
    system: SYSTEM,
    messages: [{ role: "user", content: `<denial>\n${text}\n</denial>` }],
    output_config: { format: zodOutputFormat(Answer) },
  });
  if (res.stop_reason === "refusal") throw new Error("Haiku refused");
  if (!res.parsed_output) throw new Error(`Haiku returned no parsable output (stop_reason ${res.stop_reason})`);
  const out = res.parsed_output;
  const probabilities = Object.fromEntries(LABELS.map((l) => [l, Math.min(1, Math.max(0, out[l]))])) as Record<Label, number>;
  return {
    model: res.model,
    probabilities,
    usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens },
    latency_ms: Math.round(performance.now() - start),
  };
}
