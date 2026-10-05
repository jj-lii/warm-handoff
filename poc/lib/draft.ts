// Claude appeal drafts with checked references (ADR 0020). Claude writes the prose and
// picks references by ID; it never types a citation. The server checks every ID and
// quote, then numbers the citations and builds the Sources list itself. Anything that
// fails the check falls back to the template draft from check.ts. Server-side only.
import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Finding, Verdict } from "./check";
import type { Case, ChartFact } from "./cases";
import { ACTION_ORDER, RULES, type Citation } from "./rules";

// Haiku 4.5 at $1 / $5 per million input / output tokens (claude-api skill price table, V30).
export const DRAFT_MODEL = process.env.DRAFT_MODEL ?? "claude-haiku-4-5";
export const DRAFT_PRICE = { input: 1, output: 5 };

// Changes whenever rules.ts does, so cached drafts never outlive the rules they cite.
export const RULES_VERSION = createHash("sha256").update(JSON.stringify(RULES)).digest("hex").slice(0, 12);

export type Span = { text: string; start: number; end: number };

export type DraftBlock = {
  text: string;
  answers: Span | null; // the passage of the denial this paragraph responds to
  cites: number[]; // numbers into `sources`
  facts: ChartFact[];
};

export type Draft = {
  letter_id: string;
  source: "claude" | "template";
  model: string | null;
  rules_version: string;
  header: string;
  blocks: DraftBlock[];
  sources: { n: number; source: string; quote?: string }[];
  coordinator_todos: Span[]; // reasons in the letter that none of the six rules covers
  fallback_reason?: string;
  usage?: { input_tokens: number; output_tokens: number };
  latency_ms?: number;
};

export const HEADER = "DRAFT for clinician and compliance review. Not a legal determination. Synthetic data only.";

const Output = z.object({
  paragraphs: z.array(
    z.object({
      text: z.string(),
      answers_quote: z.string().nullable(),
      citation_ids: z.array(z.string()),
      fact_ids: z.array(z.string()),
    }),
  ),
  unaddressed_quotes: z.array(z.string()),
});
type Output = z.infer<typeof Output>;

export type DraftInput = { letterId: string; letter: string; verdict: Verdict; found: Finding[]; kase?: Case };

// The citations Claude may use, each with a stable ID.
export function allowedCitations(found: Finding[]): Map<string, Citation> {
  const out = new Map<string, Citation>();
  const seen = new Set<string>();
  for (const f of found)
    for (const c of f.citations) {
      const key = `${c.source}\n${c.quote ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.set(`C${out.size + 1}`, c);
    }
  return out;
}

const SYSTEM = `You draft a reconsideration request to a Medicare Advantage plan that denied a skilled nursing facility stay. A coordinator will review and edit your draft before anything is sent.

Write 3 to 6 short paragraphs in plain, professional English, addressed to the plan.
- Answer the plan's own words. When a paragraph responds to a specific passage of the denial, copy that passage exactly, character for character, into answers_quote (one sentence or clause, no ellipses). Otherwise set it to null.
- Support each argument only with the rules given in <reasons>, by listing their citation IDs (e.g. "C2") in citation_ids. Use only IDs that appear there.
- Support clinical facts only with the chart facts given in <chart_facts>, by listing their IDs in fact_ids. Never state a clinical fact that isn't in a listed chart fact.
- Never write a source name, section number, regulation, case name or bracketed number in the text. The citations are added for you from the IDs.
- If the denial gives a reason that none of the listed reasons covers, copy that passage exactly into unaddressed_quotes instead of arguing it.`;

function userPrompt({ letter, verdict, found, kase }: DraftInput, cites: Map<string, Citation>): string {
  const byLabel = found.map((f) => {
    const ids = [...cites].filter(([, c]) => f.citations.includes(c)).map(([id, c]) => `  ${id}: ${c.source}${c.quote ? ` - "${c.quote}"` : ""}`);
    return `- ${f.title}\n  Argument: ${f.argument}\n${ids.join("\n")}`;
  });
  const facts = kase?.chart_facts.length ? kase.chart_facts.map((x) => `- ${x.id}: ${x.text} (${x.source})`).join("\n") : "(none provided)";
  return `<denial>\n${letter}\n</denial>\n\n<next_step>${verdict}</next_step>\n\n<reasons>\n${byLabel.join("\n")}\n</reasons>\n\n<chart_facts>\n${facts}\n</chart_facts>`;
}

// Characters faxed letters swap after OCR (the dev set has l/1 and O/0 swaps).
const OCR: Record<string, string> = { o: "[o0]", "0": "[o0]", l: "[l1i|]", i: "[l1i|]", "1": "[l1i|]", "|": "[l1i|]" };
const charClass = (ch: string) => OCR[ch.toLowerCase()] ?? ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Words of `quote` in order, allowing any run of whitespace between them, so a quote that
// spans a line break still matches; case-insensitive and tolerant of OCR swaps, since
// Claude tends to correct them. The span returned is the letter's own text.
export function findSpan(letter: string, quote: string): Span | null {
  const words = quote.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const re = new RegExp(words.map((w) => [...w].map(charClass).join("")).join("\\s+"), "i");
  const m = re.exec(letter);
  return m ? { text: m[0], start: m.index, end: m.index + m[0].length } : null;
}

// Invented-citation markers that must never appear in Claude's own prose.
const CITATION_IN_PROSE = /§|\bC\d+\b|\[\d+\]|\bC\.?F\.?R\.?\b|\bJimmo\b|\bCMS-\d/;

export class DraftCheckError extends Error {}

// Checks Claude's output and renders it. Throws DraftCheckError on any bad reference.
export function render(input: DraftInput, out: Output, cites: Map<string, Citation>): Omit<Draft, "source" | "model"> {
  const facts = new Map((input.kase?.chart_facts ?? []).map((f) => [f.id, f]));
  const sources: Draft["sources"] = [];
  const number = (id: string) => {
    const c = cites.get(id);
    if (!c) throw new DraftCheckError(`unknown citation ${id}`);
    let s = sources.find((x) => x.source === c.source && x.quote === c.quote);
    if (!s) sources.push((s = { n: sources.length + 1, source: c.source, quote: c.quote }));
    return s.n;
  };
  if (out.paragraphs.length === 0) throw new DraftCheckError("no paragraphs");

  const blocks = out.paragraphs.map((p): DraftBlock => {
    if (CITATION_IN_PROSE.test(p.text)) throw new DraftCheckError("citation written into prose");
    // Quotes Claude writes into its own prose must be in the letter too.
    for (const [, q] of p.text.matchAll(/["“]([^"”]{12,})["”]/g))
      if (!findSpan(input.letter, q.replace(/[.,;:]$/, ""))) throw new DraftCheckError("quote in prose not found in the denial");
    let answers: Span | null = null;
    if (p.answers_quote) {
      answers = findSpan(input.letter, p.answers_quote);
      if (!answers) throw new DraftCheckError(`quote not found in the denial: ${p.answers_quote}`);
    }
    return {
      text: p.text.trim(),
      answers,
      cites: [...new Set(p.citation_ids.map(number))],
      facts: p.fact_ids.map((id) => {
        const f = facts.get(id);
        if (!f) throw new DraftCheckError(`unknown chart fact ${id}`);
        return f;
      }),
    };
  });
  if (sources.length === 0) throw new DraftCheckError("no citations used");

  const coordinator_todos = out.unaddressed_quotes.map((q) => {
    const s = findSpan(input.letter, q);
    if (!s) throw new DraftCheckError("unaddressed quote not found in the denial");
    return s;
  });

  return { letter_id: input.letterId, rules_version: RULES_VERSION, header: HEADER, blocks, sources, coordinator_todos };
}

// The fallback: check.ts's template draft in the same shape, so the UI renders both
// the same way. Every sentence comes from rules.ts or the case's chart facts.
export function templateDraft(input: DraftInput, fallback_reason?: string): Draft {
  const ordered = [...input.found].sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action));
  const sources: Draft["sources"] = [];
  const number = (c: Citation) => {
    let s = sources.find((x) => x.source === c.source && x.quote === c.quote);
    if (!s) sources.push((s = { n: sources.length + 1, source: c.source, quote: c.quote }));
    return s.n;
  };
  const facts = input.kase?.chart_facts ?? [];
  const blocks: DraftBlock[] = [
    { text: "We ask the plan to reconsider. Its letter gives the reasons below; we address each in turn.", answers: null, cites: [], facts: [] },
    ...ordered.map((f) => ({
      text: `${f.title}. ${f.argument}`,
      answers: null,
      cites: f.citations.map(number),
      facts: f.action === "clinical_dispute" ? facts : [],
    })),
  ];
  if (facts.length && !ordered.some((f) => f.action === "clinical_dispute"))
    blocks.push({ text: "The member's current skilled needs, from the chart:", answers: null, cites: [], facts });
  return {
    letter_id: input.letterId,
    source: "template",
    model: null,
    rules_version: RULES_VERSION,
    header: HEADER,
    blocks,
    sources,
    coordinator_todos: [],
    fallback_reason,
  };
}

let client: Anthropic | undefined;

export function claudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// One Claude call. Throws on API errors or failed checks; the caller falls back.
export async function draftWithClaude(input: DraftInput): Promise<Draft> {
  client ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });
  const cites = allowedCitations(input.found);
  const start = performance.now();
  const res = await client.messages.parse({
    model: DRAFT_MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt(input, cites) }],
    output_config: { format: zodOutputFormat(Output) },
  });
  if (res.stop_reason === "refusal") throw new DraftCheckError("model refused");
  if (!res.parsed_output) throw new DraftCheckError(`no parsable output (stop_reason ${res.stop_reason})`);
  return {
    ...render(input, res.parsed_output, cites),
    source: "claude",
    model: res.model,
    usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens },
    latency_ms: Math.round(performance.now() - start),
  };
}
