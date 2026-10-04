// Minimal typed client for TypeSafe's System One HTTP API (https://docs.typesafe.ai/api).
// Server-side only: it reads TYPESAFE_API_KEY from the environment. Not imported by
// any client component; also used by the eval runner under Node, so no "server-only" guard.

const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const TIMEOUT_MS = 15_000;
const RETRIES = 2; // on 429, 529 and 5xx, with exponential backoff

export type NoulQuestion = {
  type: "noul";
  instructions: string;
  criteria?: { true: string; false: string };
};

export type NoulAnswer = { type: "noul"; noul: number };

export type SystemOneResponse<K extends string> = {
  model: string;
  answers: Record<K, NoulAnswer>;
  usage: { input_tokens: number; output_tokens: number };
};

// Errors carry a safe message for clients; upstream bodies are never forwarded.
export class JevError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function jevConfigured(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY);
}

export async function askNouls<K extends string>(
  state: unknown,
  questions: Record<K, NoulQuestion>,
): Promise<SystemOneResponse<K>> {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) throw new JevError("Classifier is not configured", 503);

  const body = JSON.stringify({ model: process.env.JEV_MODEL ?? "jev-latest", state, questions });

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
    } catch {
      if (attempt < RETRIES) {
        await backoff(attempt);
        continue;
      }
      throw new JevError("Classifier timed out or was unreachable", 504);
    }

    if (res.ok) return (await res.json()) as SystemOneResponse<K>;

    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < RETRIES) {
      await backoff(attempt);
      continue;
    }
    // 401 and 422 are our misconfiguration, not the caller's fault.
    throw new JevError("Classifier request failed", res.status === 429 ? 503 : 502);
  }
}

function backoff(attempt: number) {
  const ms = 400 * 2 ** attempt + Math.random() * 200;
  return new Promise((r) => setTimeout(r, ms));
}
