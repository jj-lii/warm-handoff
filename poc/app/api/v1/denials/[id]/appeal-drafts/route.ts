// POST /api/v1/denials/{id}/appeal-drafts: a live Claude draft for a demo denial, cached
// per letter, rules version and model; on any cap or failure, the pre-generated draft
// (ADRs 0019, 0020). No draft when the next step is manual review.
import { claudeConfigured, DraftCheckError, draftWithClaude, DRAFT_MODEL, RULES_VERSION, type Draft } from "@/lib/draft";
import { allowIp, cacheGet, cacheSet, takeDaily } from "@/lib/limits";
import { clientIp, error, fallback, json, type FallbackReason } from "@/lib/http";
import { caseFor, DRAFTS, letter, TRIAGE } from "@/lib/store";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const l = letter(id);
  const t = TRIAGE[id];
  if (!l || !t) return error(404, "not_found", "No demo denial with that ID.");
  if (t.verdict === "manual_review") return error(409, "needs_person", "No known reason found; a person should read this letter before any draft.");

  const key = `draft:${id}:${RULES_VERSION}:${DRAFT_MODEL}`;
  const cached = await cacheGet<Draft>(key);
  if (cached) return json({ live: true, cached: true, draft: cached });

  const fall = (reason: FallbackReason) => json({ live: false, fallback: fallback(reason), draft: DRAFTS[id] });
  if (!claudeConfigured()) return fall("not_configured");
  if (!(await allowIp(clientIp(req)))) return fall("rate_limited");
  if (!(await takeDaily("claude"))) return fall("daily_cap");
  try {
    const draft = await draftWithClaude({ letterId: id, letter: l.text, verdict: t.verdict, found: t.findings.filter((f) => f.detected), kase: caseFor(id) });
    await cacheSet(key, draft);
    return json({ live: true, cached: false, draft });
  } catch (e) {
    return fall(e instanceof DraftCheckError ? "check_failed" : "upstream_error");
  }
}
