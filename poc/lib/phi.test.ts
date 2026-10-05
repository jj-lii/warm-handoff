// npm test. Dev and golden letters must pass; fake identifiers must be caught. The
// holdout is never read here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { phiFindings } from "./phi";

const data = join(__dirname, "..", "evals", "data");
const letters = ["dev.jsonl", "golden.jsonl"].flatMap((f) =>
  readFileSync(join(data, f), "utf8").trim().split("\n").map((l) => JSON.parse(l) as { id: string; text: string }),
);

test("no false positives on the 80 synthetic dev and golden letters", () => {
  assert.equal(letters.length, 80);
  for (const l of letters) assert.deepEqual(phiFindings(l.text), [], l.id);
});

// All invented; none is a real person's identifier.
const caught: [string, string][] = [
  ["ssn", "Member SSN 123-45-6789 on file."],
  ["ssn", "Social security number: 123456789"],
  ["mbi", "MBI 1EG4-TE5-MK73 verified."],
  ["mbi", "Medicare ID 1EG4TE5MK73"],
  ["dob", "DOB: 04/12/1948"],
  ["dob", "Date of birth March 3, 1950"],
  ["dob", "born on 1949-07-21"],
  ["phone", "Call the family at (416) 555-0199."],
  ["phone", "Contact 416-555-0199 after 5pm"],
  ["street_address", "Lives at 221 Maple Grove Road with his daughter."],
  ["street_address", "Discharged to 40 Bay St"],
];

test("catches fake identifiers", () => {
  for (const [kind, text] of caught) assert.ok(phiFindings(text).includes(kind as never), `${kind}: ${text}`);
});

test("lets through denial dates, synthetic IDs and facility names", () => {
  for (const text of ["DATE: 03/24/2026", "Date of Review: October 14, 2026", "MBR ID: SYN-791213", "Lakeshore Care Centre", "Dr. David Robinson, Medical Director", "UM-2026-8812K"])
    assert.deepEqual(phiFindings(text), [], text);
});
