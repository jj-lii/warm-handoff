// Pre-generates everything the demo serves without a live call (ADRs 0014, 0019):
//   data/letters.json  the 40 synthetic dev letters
//   data/triage.json   Jev triage for each, from the dev eval run (no API call)
//   data/drafts.json   a draft per contestable letter: Claude for "Strong case" queue
//                      letters (with --claude), the template otherwise
// npm run pregen [-- --claude]. Claude drafts are kept while the rules version and model
// match, so re-running costs nothing unless the rules change.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { demoCases } from "../lib/cases";
import { claudeConfigured, DRAFT_MODEL, DRAFT_PRICE, draftWithClaude, RULES_VERSION, templateDraft, type Draft } from "../lib/draft";
import { preDraft } from "../lib/queue";
import { fromProbabilities, type Triage } from "../lib/triage";
import type { Label } from "../lib/rules";

const POC = join(__dirname, "..");
const out = join(POC, "data");
mkdirSync(out, { recursive: true });

type Letter = { id: string; member: string; format: string; text: string; synthetic: true };
const letters: Letter[] = readFileSync(join(POC, "evals", "data", "dev.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((l) => {
    const { id, member, format, text } = JSON.parse(l);
    return { id, member, format, text, synthetic: true };
  });

// Jev's answers from the dev eval run on the frozen questions, so the demo shows exactly
// what the report measured.
const dev = JSON.parse(readFileSync(join(POC, "evals", "results", "dev.json"), "utf8")) as {
  items: { id: string; jev: { probabilities: Record<Label, number>; latency_ms: number } }[];
};
const triage: Record<string, Triage> = Object.fromEntries(
  dev.items.map((it) => [it.id, fromProbabilities(it.jev.probabilities, { letter_id: it.id, engine: "jev", model: "jev-latest (dev eval run)", latency_ms: it.jev.latency_ms })]),
);

const draftsFile = join(out, "drafts.json");
const previous: Record<string, Draft> = existsSync(draftsFile) ? JSON.parse(readFileSync(draftsFile, "utf8")) : {};
const useClaude = process.argv.includes("--claude");
if (useClaude && !claudeConfigured()) throw new Error("--claude needs ANTHROPIC_API_KEY in the root .env");

const cases = new Map(demoCases().map((c) => [c.id, c]));
const drafts: Record<string, Draft> = {};
let spent = 0;

async function main() {
  for (const l of letters) {
    const t = triage[l.id];
    if (!t || t.verdict === "manual_review") continue; // a person reads these first (ADR 0020)
    const kase = cases.get(l.id);
    const input = { letterId: l.id, letter: l.text, verdict: t.verdict, found: t.findings.filter((f) => f.detected), kase };
    const kept = previous[l.id];
    if (kept?.source === "claude" && kept.rules_version === RULES_VERSION && kept.model?.startsWith(DRAFT_MODEL)) {
      drafts[l.id] = kept;
    } else if (useClaude && kase && preDraft(t)) {
      try {
        drafts[l.id] = await draftWithClaude(input);
        const u = drafts[l.id].usage!;
        spent += (u.input_tokens * DRAFT_PRICE.input + u.output_tokens * DRAFT_PRICE.output) / 1e6;
        console.log(`${l.id}: Claude draft (${drafts[l.id].latency_ms} ms)`);
      } catch (e) {
        drafts[l.id] = templateDraft(input, "check_failed");
        console.log(`${l.id}: Claude draft failed its check, template used (${(e as Error).message})`);
      }
    } else {
      drafts[l.id] = templateDraft(input);
    }
  }

  writeFileSync(join(out, "letters.json"), JSON.stringify(letters, null, 1));
  writeFileSync(join(out, "triage.json"), JSON.stringify(triage, null, 1));
  writeFileSync(draftsFile, JSON.stringify(drafts, null, 1));
  const claude = Object.values(drafts).filter((d) => d.source === "claude").length;
  console.log(`${letters.length} letters, ${Object.keys(triage).length} triaged, ${Object.keys(drafts).length} drafts (${claude} Claude). New Claude spend: $${spent.toFixed(4)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
