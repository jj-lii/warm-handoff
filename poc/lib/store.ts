// The pre-generated demo data (scripts/pregen.ts), bundled at build time. Synthetic only.
import lettersJson from "../data/letters.json";
import triageJson from "../data/triage.json";
import draftsJson from "../data/drafts.json";
import { demoCases, type Case } from "./cases";
import type { Draft } from "./draft";
import type { Triage } from "./triage";

export type Letter = { id: string; member: string; format: string; text: string; synthetic: true };

export const LETTERS = lettersJson as Letter[];
export const TRIAGE = triageJson as unknown as Record<string, Triage>;
export const DRAFTS = draftsJson as unknown as Record<string, Draft>;

export const letter = (id: string) => LETTERS.find((l) => l.id === id);

// Cases are rebuilt per request so deadlines stay relative to today.
export const caseFor = (id: string, today = new Date()): Case | undefined => demoCases(today).find((c) => c.id === id);
