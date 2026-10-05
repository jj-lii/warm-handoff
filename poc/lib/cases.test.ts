// Letter dates follow the case's denial date.
import { test } from "node:test";
import assert from "node:assert/strict";
import { redateLetter } from "./cases";

test("rewrites each letter date to the denial date, keeping its format", () => {
  const r = redateLetter("DATE: 03/24/2026\nDate of Review: October 14, 2026. End.", "2026-09-05");
  assert.equal(r.text, "DATE: 09/05/2026\nDate of Review: September 5, 2026. End.");
});

test("puts dates that precede the decision before the denial date", () => {
  assert.equal(redateLetter("submitted for review on March 14, 2026, the", "2026-09-05").text, "submitted for review on September 3, 2026, the");
  assert.equal(redateLetter("DOS REQ: 11/04/2026 - TBD", "2026-09-05").text, "DOS REQ: 09/02/2026 - TBD");
});

test("maps highlight offsets past a rewritten date", () => {
  const original = "Date: October 14, 2026. The member resided here.";
  const r = redateLetter(original, "2026-05-01");
  const start = original.indexOf("The member"), end = original.length;
  assert.equal(r.text.slice(r.at(start), r.at(end)), "The member resided here.");
  assert.equal(r.at(0), 0);
});
