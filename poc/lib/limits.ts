// Spend caps and the live draft cache (ADR 0019): a per-IP rate limit and global daily
// caps on live calls, in Upstash Redis when configured, else in this process's memory
// (fine locally; per-instance on Vercel, so leaky there).
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const PER_IP_PER_MINUTE = 10;
export const DAILY_CAP = { claude: 100, jev: 300 } as const;
export type Spend = keyof typeof DAILY_CAP;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

export const limitsBackend = redis ? "upstash" : "memory";

const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(PER_IP_PER_MINUTE, "1 m"), prefix: "denial-check:ip" })
  : null;

const memHits = new Map<string, number[]>();
const memCounts = new Map<string, number>();
const memCache = new Map<string, string>();

export async function allowIp(ip: string): Promise<boolean> {
  if (ratelimit) return (await ratelimit.limit(ip)).success;
  const now = Date.now();
  const recent = (memHits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= PER_IP_PER_MINUTE) return false;
  memHits.set(ip, [...recent, now]);
  return true;
}

// Takes one unit of today's budget; false once the cap is reached.
export async function takeDaily(kind: Spend): Promise<boolean> {
  const key = `denial-check:cap:${kind}:${new Date().toISOString().slice(0, 10)}`;
  if (redis) {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, 2 * 86_400);
    return n <= DAILY_CAP[kind];
  }
  const n = (memCounts.get(key) ?? 0) + 1;
  memCounts.set(key, n);
  return n <= DAILY_CAP[kind];
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(`denial-check:${key}`)) ?? null;
  const v = memCache.get(key);
  return v ? (JSON.parse(v) as T) : null;
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  if (redis) await redis.set(`denial-check:${key}`, value, { ex: 30 * 86_400 });
  else memCache.set(key, JSON.stringify(value));
}
