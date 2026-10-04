// Generates synthetic MA denial letters with Gemini (ADR 0015).
//   npm run generate -- dev|golden|holdout
// dev and golden go to evals/data/<split>.jsonl (committed: synthetic only).
// holdout goes to ../private/holdout.jsonl (gitignored) and only counts are printed:
// Claude never reads it. Re-running resumes: ids already written are skipped.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { FORMATS, RECIPES, type Format, type Recipe } from "./recipes";
import { RULES, type Label } from "../lib/rules";

const SPLITS = ["dev", "golden", "holdout"] as const;
type Split = (typeof SPLITS)[number];

const split = process.argv[2] as Split;
if (!SPLITS.includes(split)) throw new Error(`usage: generate <${SPLITS.join("|")}>`);
const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
if (!KEY) throw new Error("GEMINI_API_KEY is not set (root .env)");

const outPath = (s: Split) =>
  s === "holdout" ? join(process.cwd(), "../private/holdout.jsonl") : join(process.cwd(), `evals/data/${s}.jsonl`);

// Plain descriptions in the payer's voice. Deliberately NOT the wording of the Jev
// questions in lib/rules.ts, so the test doesn't reward matching our own phrasing.
const ARCHETYPE: Record<Label, string> = {
  residency:
    "The reviewer points to the member's long-term placement in a nursing facility, or the circumstances that led to that placement, as part of why a skilled admission isn't warranted.",
  therapy_participation:
    "The reviewer doubts the member can engage in or benefit from a daily rehabilitation program, for example because of cognition, behaviours, endurance or prior level of function.",
  no_improvement:
    "The reviewer says the member isn't expected to make functional gains, is at or near baseline, or that the care would only keep them where they are.",
  custodial_substitute:
    "The reviewer says the member's needs can be handled by the care they already receive in long-term care, by occasional therapy or nursing visits, or at a lower level of care.",
  no_daily_skilled_need:
    "The reviewer concludes on clinical grounds that the ordered services don't require a licensed nurse or therapist, or aren't needed every day.",
  missing_documentation:
    "The reviewer says the records sent were incomplete or never arrived (for example orders, a therapy evaluation or recent nursing notes), so the request can't be approved as submitted.",
};

// Topic only, for hard cases: the letter mentions it without denying on it.
const TOPIC: Record<Label, string> = {
  residency: "the member's long-term residence at the facility",
  therapy_participation: "the member's participation in therapy",
  no_improvement: "the member's potential for functional improvement",
  custodial_substitute: "the custodial care and services the member already receives",
  no_daily_skilled_need: "whether the member's needs are skilled and needed daily",
  missing_documentation: "the records the facility submitted",
};

const FORMAT_SPEC: Record<Format, string> = {
  plan_letter: "A formal written notice of denial from the plan's utilization management department, with headings.",
  portal_note: "A terse determination note as it would appear in a payer portal: short lines, abbreviations, no letterhead.",
  fax_ocr:
    "A faxed denial letter after OCR: a few broken words, odd line breaks, stray characters and l/1 or O/0 swaps, but still readable.",
  ire_notice: "A reconsideration decision summary from an independent review entity that upholds the plan's original denial.",
  p2p_summary: "A summary of a peer-to-peer call written by the plan's medical director after speaking with the facility's physician.",
};

// Basketball names (CLAUDE.md). No teams are named, so Kawhi Leonard is never off the Raptors.
const MEMBERS = [
  "Kawhi Leonard", "Kyle Lowry", "Stephen Curry", "DeMar DeRozan", "Vince Carter", "Pascal Siakam",
  "Fred VanVleet", "Chris Bosh", "Dirk Nowitzki", "Steve Nash", "Klay Thompson", "Draymond Green",
  "Kevin Garnett", "Paul Pierce", "Ray Allen", "Dwyane Wade", "Tony Parker", "Manu Ginobili",
  "Jason Kidd", "Allen Iverson",
];
const REVIEWERS = ["Hakeem Olajuwon", "Tim Duncan", "David Robinson", "Patrick Ewing", "Bill Russell", "Dikembe Mutombo"];
const PLANS = ["Maple Crest Advantage (HMO)", "Northline Senior Choice PPO", "Harborview Medicare Plus", "Summit Ridge Advantage HMO-POS"];
const FACILITIES = ["Lakeshore Care Centre", "Birchwood Nursing and Rehabilitation", "Riverside Manor", "Cedar Hollow Health Center"];

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function prompt(recipe: Recipe, format: Format, member: string, reviewer: string, plan: string, facility: string, memberId: string) {
  const reasons = recipe.intent.length
    ? `The denial gives these reasons, each clearly stated in the payer's own words (paraphrase; never copy these descriptions):\n${recipe.intent.map((l) => `- ${ARCHETYPE[l]}`).join("\n")}`
    : `The denial's only reason is administrative: ${recipe.out_of_scope}. Give no clinical reason for denying.`;
  const distractor = recipe.distractor
    ? `\nAlso mention ${TOPIC[recipe.distractor]}, but WITHOUT making it a reason for the denial: state it as background, say the decision is not based on it, or note that it is satisfied.`
    : "";
  return `You write realistic but entirely fictional Medicare Advantage denial documents for testing software. Everything is synthetic.

Situation: ${member} is a long-stay resident of ${facility} (on custodial care for many months). After a change in condition, the facility asked the member's plan, ${plan}, to approve a short-term skilled nursing facility (SNF) stay. The plan denied it.

Format: ${FORMAT_SPEC[format]}
Reviewer: Dr. ${reviewer}, medical director. Member ID: ${memberId}.
${reasons}${distractor}

Rules:
- Start with the line "[SYNTHETIC TEST DOCUMENT]".
- 80 to 350 words. Vary structure and tone; payers often use boilerplate and hedged clinical language.
- Use only the names given. Never name a real insurer, contractor, hospital or person. Name no sports teams.
- No phone numbers, street addresses, dates of birth, Social Security or Medicare numbers. Dates, if any, fall in 2026.
- Do not label or list the reasons with category names; write as the payer would.`;
}

async function gemini(text: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY! },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          temperature: 1,
          responseMimeType: "application/json",
          responseSchema: { type: "OBJECT", properties: { letter: { type: "STRING" } }, required: ["letter"] },
        },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (res.ok) {
      const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const raw = body.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error("Gemini returned no text");
      return (JSON.parse(raw) as { letter: string }).letter.trim();
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const retryAfter = Number(res.headers.get("retry-after")) * 1000;
      await new Promise((r) => setTimeout(r, retryAfter || 5000 * 2 ** attempt));
      continue;
    }
    throw new Error(`Gemini ${res.status}`);
  }
}

// Flags letters that reuse 6+ consecutive words from our Jev questions or criteria.
const OUR_WORDING = Object.values(RULES).flatMap((r) => [r.question, r.criteria.true, r.criteria.false]);
function leaks(letter: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter(Boolean);
  const text = ` ${norm(letter).join(" ")} `;
  let n = 0;
  for (const src of OUR_WORDING) {
    const w = norm(src);
    for (let i = 0; i + 6 <= w.length; i++) if (text.includes(` ${w.slice(i, i + 6).join(" ")} `)) n++;
  }
  return n;
}

async function main() {
  const out = outPath(split);
  mkdirSync(dirname(out), { recursive: true });
  const done = new Set(
    existsSync(out) ? readFileSync(out, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).id as string) : [],
  );
  const rand = rng(SPLITS.indexOf(split) * 1000 + 7);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

  // Shuffle so an id's position says nothing about its labels.
  const order = RECIPES.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const jobs = order.map((k) => RECIPES[k]).map((recipe, i) => {
    const id = `${split}-${String(i + 1).padStart(3, "0")}`;
    const member = i === 0 ? "Kawhi Leonard" : pick(MEMBERS);
    const format = pick(FORMATS); // random, so format can't stand in for the labels
    const p = prompt(recipe, format, member, pick(REVIEWERS), pick(PLANS), pick(FACILITIES), `SYN-${Math.floor(100000 + rand() * 899999)}`);
    return { id, recipe, format, member, p };
  }).filter((j) => !done.has(j.id));

  // Review aid for the spec: print sample prompts (never for the holdout) and stop.
  if (process.argv.includes("--print-prompts")) {
    if (split === "holdout") throw new Error("not for the holdout");
    for (const i of [0, 15, 30, 34]) console.log(`--- ${jobs[i]?.id}\n${jobs[i]?.p}\n`);
    return;
  }

  let written = 0, leaked = 0, failed = 0;
  const queue = [...jobs];
  await Promise.all(
    // Free-tier keys allow only a few requests a minute: default to one at a time, spaced.
    Array.from({ length: Number(process.env.GEN_CONCURRENCY ?? 1) }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        await new Promise((r) => setTimeout(r, Number(process.env.GEN_INTERVAL_MS ?? 6500)));
        try {
          const text = await gemini(job.p);
          const l = leaks(text);
          if (l) leaked++;
          const record = {
            id: job.id,
            split,
            synthetic: true,
            intent: job.recipe.intent,
            distractor: job.recipe.distractor ?? null,
            out_of_scope: job.recipe.out_of_scope ?? null,
            format: job.format,
            member: job.member,
            text,
            wording_overlap: l,
            generator: {
              model: MODEL,
              prompt_sha256: createHash("sha256").update(job.p).digest("hex"),
              generated_at: new Date().toISOString(),
            },
          };
          appendFileSync(out, JSON.stringify(record) + "\n");
          written++;
        } catch (e) {
          failed++;
          console.error(`${job.id}: ${(e as Error).message}`);
        }
      }
    }),
  );
  console.log(`${split}: ${written} written, ${done.size} already present, ${failed} failed, ${leaked} with wording overlap -> ${split === "holdout" ? "private/holdout.jsonl" : out}`);
}

main();
