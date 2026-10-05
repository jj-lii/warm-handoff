// The reference check, without calling Claude.
import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedCitations, DraftCheckError, findSpan, render, templateDraft, type DraftInput } from "./draft";
import { demoCases } from "./cases";
import { RULES, type Label } from "./rules";
import type { Finding } from "./check";

const finding = (label: Label): Finding => ({
  label,
  title: RULES[label].title,
  action: RULES[label].action,
  probability: 0.95,
  detected: true,
  needs_review: false,
  argument: RULES[label].argument,
  citations: RULES[label].citations,
});

const letter = "SYNTHETIC. The member has resided at the facility for months.\nServices may be safely managed at the\ncustodial baseline.";
const kase = demoCases().find((c) => c.id === "dev-001")!;
const input: DraftInput = { letterId: "dev-001", letter, verdict: "contest_on_rules", found: [finding("residency")], kase };
const cites = allowedCitations(input.found);
const para = (over: object = {}) => ({ text: "Residence is not a coverage criterion.", answers_quote: null, citation_ids: ["C1"], fact_ids: [], ...over });

test("renders a valid draft, numbering citations and finding quotes across line breaks", () => {
  const d = render(input, { paragraphs: [para({ answers_quote: "safely managed at the custodial baseline", fact_ids: ["dev-001-f2"] })], unaddressed_quotes: [] }, cites);
  assert.deepEqual(d.blocks[0].cites, [1]);
  assert.equal(d.sources[0].source, cites.get("C1")!.source);
  assert.equal(letter.slice(d.blocks[0].answers!.start, d.blocks[0].answers!.end), "safely managed at the\ncustodial baseline");
  assert.equal(d.blocks[0].facts[0].id, "dev-001-f2");
});

for (const [name, out] of [
  ["unknown citation", { paragraphs: [para({ citation_ids: ["C99"] })], unaddressed_quotes: [] }],
  ["unknown chart fact", { paragraphs: [para({ fact_ids: ["dev-999-f1"] })], unaddressed_quotes: [] }],
  ["quote not in the letter", { paragraphs: [para({ answers_quote: "the member refused therapy" })], unaddressed_quotes: [] }],
  ["citation written into prose", { paragraphs: [para({ text: "Under Ch. 8 §30 residence is irrelevant." })], unaddressed_quotes: [] }],
  ["invented quote in prose", { paragraphs: [para({ text: 'The plan wrote "the member declined all therapy sessions".' })], unaddressed_quotes: [] }],
  ["no citations at all", { paragraphs: [para({ citation_ids: [] })], unaddressed_quotes: [] }],
] as const)
  test(`rejects: ${name}`, () => assert.throws(() => render(input, out as never, cites), DraftCheckError));

test("findSpan returns null for absent text", () => assert.equal(findSpan(letter, "not here"), null));

test("findSpan matches across case and OCR swaps, returning the letter's own text", () => {
  const ocr = "rec3iving custodial-level care at Birchw0od Nursing f0r an extended durati0n.";
  assert.equal(findSpan(ocr, "At Birchwood nursing for an extended")?.text, "at Birchw0od Nursing f0r an extended");
});

test("template draft cites every detected reason", () => {
  const d = templateDraft(input, "test");
  assert.equal(d.source, "template");
  assert.ok(d.sources.length >= 1);
});
