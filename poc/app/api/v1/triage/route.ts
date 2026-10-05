// POST /api/v1/triage: live, stateless Jev triage of one denial. Body is either
// {letter_id} (a demo letter; falls back to its pre-generated triage) or {text} (any
// synthetic letter; PHI tripwire applies, no fallback). Capped per ADR 0019.
import { z } from "zod";
import { jevConfigured } from "@/lib/jev";
import { allowIp, takeDaily } from "@/lib/limits";
import { clientIp, error, fallback, json, readBody, type FallbackReason } from "@/lib/http";
import { phiFindings } from "@/lib/phi";
import { letter, TRIAGE } from "@/lib/store";
import { triageLive } from "@/lib/triage";

const Body = z.union([
  z.object({ letter_id: z.string().max(32) }).strict(),
  z.object({ text: z.string().min(50).max(15_000) }).strict(),
]);

export async function POST(req: Request) {
  const body = await readBody(req, Body);
  if (!body.ok) return body.res;

  const id = "letter_id" in body.data ? body.data.letter_id : null;
  const text = id ? letter(id)?.text : "text" in body.data ? body.data.text : undefined;
  if (!text) return error(404, "not_found", "No demo denial with that ID.");
  if (!id) {
    const phi = phiFindings(text);
    if (phi.length) return error(422, "phi_suspected", `This looks like it contains real identifiers (${phi.join(", ")}). Synthetic letters only.`);
  }

  const fall = (reason: FallbackReason, status = 503) =>
    id ? json({ live: false, fallback: fallback(reason), triage: TRIAGE[id] }) : error(status, reason, fallback(reason).message);

  if (!jevConfigured()) return fall("not_configured");
  if (!(await allowIp(clientIp(req)))) return fall("rate_limited", 429);
  if (!(await takeDaily("jev"))) return fall("daily_cap", 429);
  try {
    return json({ live: true, triage: await triageLive(text, id) });
  } catch {
    return fall("upstream_error");
  }
}
