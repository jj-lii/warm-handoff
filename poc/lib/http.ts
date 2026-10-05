// Shared route helpers: JSON responses, a capped body reader, client IP and the fallback
// note shown when a live call can't run (ADR 0019). Errors never echo request text.
import type { z } from "zod";

export const MAX_BODY_BYTES = 20 * 1024;

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const error = (status: number, code: string, message: string) => json({ error: { code, message } }, status);

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

// Reads and validates a JSON body, refusing anything over MAX_BODY_BYTES.
export async function readBody<T>(req: Request, schema: z.ZodType<T>): Promise<{ ok: true; data: T } | { ok: false; res: Response }> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return { ok: false, res: error(413, "body_too_large", "Request body is over 20 KB.") };
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return { ok: false, res: error(413, "body_too_large", "Request body is over 20 KB.") };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, res: error(400, "invalid_json", "Request body must be JSON.") };
  }
  const r = schema.safeParse(parsed);
  if (!r.success) return { ok: false, res: error(400, "invalid_request", r.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")) };
  return { ok: true, data: r.data };
}

export type FallbackReason = "rate_limited" | "daily_cap" | "not_configured" | "upstream_error" | "check_failed";

export const REPO_URL = "https://github.com/jj-lii/warm-handoff";

const MESSAGES: Record<FallbackReason, string> = {
  rate_limited: "Too many live runs from your connection in the last minute.",
  daily_cap: "The live demo's budget for today is used up (likely automated traffic).",
  not_configured: "Live calls aren't configured on this deployment.",
  upstream_error: "The model service didn't answer in time.",
  check_failed: "The live draft failed its citation check, so it wasn't shown.",
};

export function fallback(reason: FallbackReason) {
  return {
    reason,
    message: `${MESSAGES[reason]} Showing the pre-generated result instead. Message the author to top it up, or run it yourself from the repo.`,
    repo: REPO_URL,
  };
}
