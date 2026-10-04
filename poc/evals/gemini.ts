// Gemini Flash-Lite baseline: the same prompt and six questions Haiku gets, answered
// as six probabilities with structured output. Evals only. Gemini also wrote the
// synthetic letters, so this engine may be advantaged on them (ADR 0016).
import type { Classification } from "../lib/classify";
import { LABELS, type Label } from "../lib/rules";
import { SYSTEM } from "./haiku";

export const GEMINI_CLASSIFIER_MODEL = process.env.GEMINI_CLASSIFIER_MODEL ?? "gemini-3.1-flash-lite"; // cheapest open to new keys; 2.5 Flash-Lite returns 404
// USD per million tokens, input / output (output includes thinking tokens). Paid tier,
// https://ai.google.dev/gemini-api/docs/pricing, read 2026-10-04. V32.
export const GEMINI_PRICE = { input: 0.25, output: 1.5 };

export async function classifyGemini(text: string): Promise<Omit<Classification, "engine">> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set (root .env)");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CLASSIFIER_MODEL}:generateContent`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: `<denial>\n${text}\n</denial>` }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: Object.fromEntries(LABELS.map((l) => [l, { type: "NUMBER" }])),
        required: [...LABELS],
      },
    },
  });

  const start = performance.now();
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) {
      const j = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
        modelVersion?: string;
      };
      const raw = j.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error(`Gemini returned no text (finishReason ${j.candidates?.[0]?.finishReason})`);
      const out = JSON.parse(raw) as Record<Label, number>;
      const probabilities = Object.fromEntries(LABELS.map((l) => [l, Math.min(1, Math.max(0, Number(out[l]) || 0))])) as Record<Label, number>;
      const u = j.usageMetadata ?? {};
      return {
        model: j.modelVersion ?? GEMINI_CLASSIFIER_MODEL,
        probabilities,
        usage: { input_tokens: u.promptTokenCount ?? 0, output_tokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0) },
        latency_ms: Math.round(performance.now() - start),
      };
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    throw new Error(`Gemini ${res.status}`);
  }
}
