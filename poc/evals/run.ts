// Eval runner (ADR 0015): keyword baseline, Claude Haiku and Jev on one split,
// scored against the author's blind labels.
//   npm run eval -- dev|golden|real [--engines=keyword,haiku,jev] [--no-cache]
//   npm run eval:baseline -- dev          keyword only, no keys or network
//   npm run eval -- holdout --final       once, after PREREGISTRATION.md is committed
// dev and golden write evals/results/<split>.{json,md} (synthetic, committable).
// real and holdout write ../private/results/; the holdout prints aggregates only.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { classify, CONTEXT, THRESHOLD } from "../lib/classify";
import { LABELS, RULES, type Label } from "../lib/rules";
import { classifyHaiku, HAIKU_PRICE, SYSTEM as HAIKU_SYSTEM } from "./haiku";
import { brier, costLatency, goldVerdict, headline, perLabel, predicted, predictedVerdict, sweep, wilson, type Interval, type Scored } from "./metrics";

const SPLITS = ["dev", "golden", "holdout", "real"] as const;
type Split = (typeof SPLITS)[number];
const ENGINES = ["keyword", "haiku", "jev"] as const;
type EngineName = (typeof ENGINES)[number];

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const split = args.find((a) => !a.startsWith("--")) as Split;
if (!SPLITS.includes(split)) throw new Error(`usage: eval <${SPLITS.join("|")}> [--engines=keyword,haiku,jev] [--baseline-only] [--no-cache] [--final]`);
const final = flag("final");
const engines = (flag("baseline-only") ? ["keyword"] : (opt("engines")?.split(",") ?? [...ENGINES])) as EngineName[];
if (!engines.every((e) => ENGINES.includes(e))) throw new Error(`unknown engine in ${engines.join(",")}`);
const useCache = !flag("no-cache") && split !== "holdout";
const CONCURRENCY = Number(process.env.EVAL_CONCURRENCY ?? 4);

const POC = process.cwd();
const ROOT = join(POC, "..");
const priv = split === "holdout" || split === "real";
const itemsPath = priv ? join(ROOT, `private/${split === "real" ? "real-slice" : "holdout"}.jsonl`) : join(POC, `evals/data/${split}.jsonl`);
const labelsPath = priv ? join(ROOT, `private/labels/${split}.jsonl`) : join(POC, `evals/data/labels/${split}.jsonl`);
const outDir = priv ? join(ROOT, "private/results") : join(POC, "evals/results");
const cacheDir = join(POC, ".eval-cache");

const sha256 = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const readJsonl = <T,>(p: string): T[] => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l) as T) : []);

type Item = { id: string; text: string; intent?: Label[]; distractor?: string | null; out_of_scope?: string | null };
type LabelRow = { id: string; labels: Label[]; unsure: boolean };

// The holdout runs once (ADR 0015): only with --final, only after a committed
// pre-registration that names the hash of every split and of rules.ts.
function guardHoldout() {
  if (!final) throw new Error("the holdout runs only with --final, once, after PREREGISTRATION.md is committed");
  if (!engines.every((e) => ENGINES.includes(e)) || engines.length !== ENGINES.length) throw new Error("--final runs every engine");
  const prereg = join(POC, "evals/PREREGISTRATION.md");
  if (!existsSync(prereg)) throw new Error("evals/PREREGISTRATION.md is missing");
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", prereg], { stdio: "ignore" });
    execFileSync("git", ["diff", "--quiet", "HEAD", "--", prereg], { stdio: "ignore" });
  } catch {
    throw new Error("PREREGISTRATION.md must be committed with no local changes");
  }
  const text = readFileSync(prereg, "utf8");
  const hashed = [
    join(POC, "lib/rules.ts"),
    ...(["dev", "golden"] as const).flatMap((s) => [join(POC, `evals/data/${s}.jsonl`), join(POC, `evals/data/labels/${s}.jsonl`)]),
    join(ROOT, "private/holdout.jsonl"),
    join(ROOT, "private/labels/holdout.jsonl"),
  ];
  for (const f of hashed) {
    if (!existsSync(f)) throw new Error(`pre-registered file missing: ${f}`);
    if (!text.includes(sha256(readFileSync(f)))) throw new Error(`hash of ${f} is not in PREREGISTRATION.md (changed since, or never registered)`);
  }
  const marker = join(ROOT, "private/holdout-final-run.json");
  if (existsSync(marker)) throw new Error(`the holdout has already run (${marker}). Delete it only if that run failed before producing results.`);
  mkdirSync(dirname(marker), { recursive: true });
  writeFileSync(marker, JSON.stringify({ started_at: new Date().toISOString(), rules_sha256: sha256(readFileSync(join(POC, "lib/rules.ts"))) }) + "\n");
}

// What a cached answer depends on: the model's prompt and the letter.
const promptKey: Record<EngineName, () => string> = {
  keyword: () => "", // free and instant: never cached
  haiku: () => sha256(`${process.env.HAIKU_MODEL ?? ""}|${HAIKU_SYSTEM}`),
  jev: () => sha256(`${process.env.JEV_MODEL ?? ""}|${CONTEXT}|${JSON.stringify(LABELS.map((l) => [RULES[l].question, RULES[l].criteria]))}`),
};

type Run = { model: string; probabilities: Record<Label, number>; latency_ms: number; usage?: { input_tokens: number; output_tokens: number } };

async function runOne(engine: EngineName, text: string): Promise<Run & { cached: boolean }> {
  const file = join(cacheDir, engine, `${sha256(promptKey[engine]() + "\n" + text)}.json`);
  if (engine !== "keyword" && useCache && existsSync(file)) return { ...(JSON.parse(readFileSync(file, "utf8")) as Run), cached: true };
  const r: Run =
    engine === "keyword" ? await classify(text, "baseline") : engine === "jev" ? await classify(text, "jev") : await classifyHaiku(text);
  const run: Run = { model: r.model, probabilities: r.probabilities, latency_ms: r.latency_ms, usage: r.usage };
  if (engine !== "keyword" && useCache) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(run));
  }
  return { ...run, cached: false };
}

async function pool<T>(xs: T[], n: number, f: (x: T) => Promise<void>) {
  const q = [...xs];
  await Promise.all(Array.from({ length: Math.max(1, n) }, async () => { for (let x = q.shift(); x !== undefined; x = q.shift()) await f(x); }));
}

const pct = (v: number | null | undefined) => (v == null ? "n/a" : `${Math.round(v * 100)}%`);
const ci = (i: Interval) => (i.value == null ? "n/a" : `${pct(i.value)} (${i.k}/${i.n}, ${pct(i.lo)}-${pct(i.hi)})`);

async function main() {
  if (split === "holdout") guardHoldout();

  // First row per id wins, matching what the labelling tool shows first.
  const all = readJsonl<Item>(itemsPath);
  const items = [...new Map(all.reverse().map((x) => [x.id, x])).values()].reverse();
  const dupes = all.length - items.length;
  const labels = new Map(readJsonl<LabelRow>(labelsPath).map((r) => [r.id, r]));
  const labelled = items.filter((x) => labels.has(x.id));
  if (!labelled.length) throw new Error(`no labelled items for ${split} (labels: ${labelsPath})`);

  const results: Record<EngineName, Scored[]> = { keyword: [], haiku: [], jev: [] };
  const errors: Record<EngineName, number> = { keyword: 0, haiku: 0, jev: 0 };
  const models: Partial<Record<EngineName, string>> = {};
  let cached = 0;
  const perItem: Record<string, Record<string, unknown>> = {};

  for (const engine of engines) {
    await pool(labelled, engine === "keyword" ? 1 : CONCURRENCY, async (x) => {
      const gold = labels.get(x.id)!;
      try {
        const r = await runOne(engine, x.text);
        if (r.cached) cached++;
        models[engine] = r.model;
        const s: Scored = {
          id: x.id,
          gold: gold.labels,
          unsure: gold.unsure,
          hard: Boolean(x.distractor || x.out_of_scope),
          probabilities: r.probabilities,
          probabilistic: engine !== "keyword",
          latency_ms: r.latency_ms,
          usage: r.usage,
        };
        results[engine].push(s);
        (perItem[x.id] ??= { id: x.id, gold: gold.labels, gold_verdict: goldVerdict(s), unsure: gold.unsure, hard: s.hard, intent: x.intent ?? null })[engine] = {
          probabilities: r.probabilities,
          detected: predicted(s),
          verdict: predictedVerdict(s),
          latency_ms: r.latency_ms,
          cached: r.cached,
        };
      } catch (e) {
        errors[engine]++;
        if (split !== "holdout") console.error(`${engine} ${x.id}: ${(e as Error).message}`);
      }
    });
    results[engine].sort((a, b) => a.id.localeCompare(b.id));
  }

  const summary = summarize({ items, labelled, labels, dupes, results, errors, models });

  mkdirSync(outDir, { recursive: true });
  const base = join(outDir, final ? `${split}-final` : split);
  writeFileSync(`${base}.json`, JSON.stringify({ summary, items: Object.values(perItem).sort((a, b) => String(a.id).localeCompare(String(b.id))) }, null, 2) + "\n");
  writeFileSync(`${base}.md`, report(summary));

  console.log(report(summary));
  console.log(`${cached} cached answers reused. Written: ${base}.{json,md}`);
}

type Ctx = {
  items: Item[];
  labelled: Item[];
  labels: Map<string, LabelRow>;
  dupes: number;
  results: Record<EngineName, Scored[]>;
  errors: Record<EngineName, number>;
  models: Partial<Record<EngineName, string>>;
};

function summarize({ items, labelled, labels, dupes, results, errors, models }: Ctx) {
  const price: Partial<Record<EngineName, { input: number; output: number }>> = { haiku: HAIKU_PRICE }; // Jev price: V31
  return {
    split,
    run_at: new Date().toISOString(),
    final,
    threshold: THRESHOLD,
    rules_sha256: sha256(readFileSync(join(POC, "lib/rules.ts"))),
    items: { total: items.length, labelled: labelled.length, unsure: labelled.filter((x) => labels.get(x.id)!.unsure).length, duplicate_rows_dropped: dupes },
    // Data quality: how often Gemini's intended reasons match the blind labels exactly.
    intent_matches_labels: agreement(labelled.filter((x) => x.intent).map((x) => sameSet(x.intent!, labels.get(x.id)!.labels))),
    engines: Object.fromEntries(
      engines.map((e) => {
        const s = results[e];
        return [
          e,
          {
            model: models[e] ?? null,
            errors: errors[e],
            headline: headline(s),
            // Real slice: exact match of the detected reasons with the blind labels.
            label_set_agreement: agreement(s.map((x) => sameSet(predicted(x), x.gold))),
            hard_cases: headline(s.filter((x) => x.hard)),
            excluding_unsure: headline(s.filter((x) => !x.unsure)),
            brier: e === "keyword" ? null : brier(s),
            per_label: perLabel(s),
            cost: costLatency(s, price[e]),
            threshold_sweep: split === "dev" && e !== "keyword" ? sweep(s) : undefined,
          },
        ];
      }),
    ),
  };
}
type Summary = ReturnType<typeof summarize>;

function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}
function agreement(bools: boolean[]) {
  return wilson(bools.filter(Boolean).length, bools.length);
}

function report(s: Summary): string {
  const es = Object.keys(s.engines);
  const row = (name: string, f: (e: Summary["engines"][string]) => string) => `| ${name} | ${es.map((e) => f(s.engines[e])).join(" | ")} |`;
  const lines = [
    `# Eval: ${s.split}${s.final ? " (final)" : ""}`,
    "",
    `Synthetic letters${s.split === "real" ? " (real slice: public Council passages)" : ""}. Gold = author's blind labels. Threshold ${s.threshold}. rules.ts ${s.rules_sha256.slice(0, 12)}. ${s.run_at}`,
    `Items: ${s.items.labelled} labelled of ${s.items.total} (${s.items.unsure} marked unsure)${s.items.duplicate_rows_dropped ? `; ${s.items.duplicate_rows_dropped} duplicate rows dropped (first row per id kept)` : ""}.`,
    s.intent_matches_labels.n ? `Generator intent matches blind labels exactly: ${ci(s.intent_matches_labels)}.` : "",
    "",
    "## Headline",
    "",
    `| Metric | ${es.join(" | ")} |`,
    `|---|${es.map(() => "---").join("|")}|`,
    row("Precision, top of queue", (e) => `${pct(e.headline.precision_at_top.value)} (top ${e.headline.precision_at_top.k})`),
    row("Right next step", (e) => ci(e.headline.right_next_step)),
    row("Contestable denials caught", (e) => ci(e.headline.contestable_caught)),
    row("Wrongly contested", (e) => ci(e.headline.wrongly_contested)),
    row("Sent to a person", (e) => ci(e.headline.sent_to_person)),
    row("Reason set matches labels", (e) => ci(e.label_set_agreement)),
    row("Right next step, hard cases", (e) => ci(e.hard_cases.right_next_step)),
    row("Right next step, excl. unsure", (e) => ci(e.excluding_unsure.right_next_step)),
    row("Brier (mean over labels)", (e) => (e.brier == null ? "n/a" : e.brier.toFixed(3))),
    row("Latency p50 / p90", (e) => `${e.cost.latency_ms.p50 ?? "n/a"} / ${e.cost.latency_ms.p90 ?? "n/a"} ms`),
    row("Tokens in / out per letter", (e) => (e.cost.tokens_per_letter ? `${e.cost.tokens_per_letter.input} / ${e.cost.tokens_per_letter.output}` : "n/a")),
    row("USD per letter", (e) => (e.cost.usd_per_letter == null ? "n/a" : `$${e.cost.usd_per_letter.toFixed(5)}`)),
    row("Errors", (e) => String(e.errors)),
    "",
    "## Per reason (precision / recall, 95% Wilson)",
    "",
    `| Reason | Support | ${es.join(" | ")} |`,
    `|---|---|${es.map(() => "---").join("|")}|`,
    ...LABELS.map((l) => `| ${l} | ${s.engines[es[0]].per_label[l].support} | ${es.map((e) => `P ${ci(s.engines[e].per_label[l].precision)}<br>R ${ci(s.engines[e].per_label[l].recall)}`).join(" | ")} |`),
  ];
  const sweeps = es.filter((e) => s.engines[e].threshold_sweep);
  if (sweeps.length) {
    lines.push("", "## Threshold sweep (dev only)", "", "| Engine | Threshold | Right next step | Caught | Wrongly contested | To a person |", "|---|---|---|---|---|---|");
    for (const e of sweeps)
      for (const t of s.engines[e].threshold_sweep!)
        lines.push(`| ${e} | ${t.threshold} | ${pct(t.right_next_step)} | ${pct(t.contestable_caught)} | ${pct(t.wrongly_contested)} | ${pct(t.sent_to_person)} |`);
  }
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n") + "\n";
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
