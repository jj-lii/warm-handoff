// GET /api/v1/denials/{id}: the letter, its demo case, pre-generated triage and draft.
import { summarize } from "@/lib/api";
import { error, json } from "@/lib/http";
import { caseFor, DRAFTS, letter, TRIAGE } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const l = letter(id);
  if (!l) return error(404, "not_found", "No demo denial with that ID.");
  return json({ summary: summarize(id), letter: l, case: caseFor(id) ?? null, triage: TRIAGE[id], draft: DRAFTS[id] ?? null });
}
