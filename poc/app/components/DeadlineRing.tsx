import { APPEAL_WINDOW_DAYS } from "@/lib/cases";
import { URGENT_DAYS } from "@/lib/queue";

// A ring that fills as the appeal window runs out; amber inside two weeks, red inside
// URGENT_DAYS. No number inside: the days-left text sits next to it.
export function DeadlineRing({ daysLeft }: { daysLeft: number }) {
  const used = Math.min(1, Math.max(0, 1 - daysLeft / APPEAL_WINDOW_DAYS));
  const r = 15;
  const c = 2 * Math.PI * r;
  const tone = daysLeft <= URGENT_DAYS ? "urgent" : daysLeft <= 14 ? "soon" : "calm";
  return (
    <span className={`ring ring-${tone}`} aria-hidden>
      <svg viewBox="0 0 36 36" width="36" height="36">
        <circle cx="18" cy="18" r={r} className="ring-track" />
        <circle cx="18" cy="18" r={r} className="ring-fill" strokeDasharray={`${used * c} ${c}`} transform="rotate(-90 18 18)" />
      </svg>
    </span>
  );
}

export function daysText(daysLeft: number): string {
  if (daysLeft < 0) return "Past due";
  if (daysLeft === 0) return "Due today";
  return daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
}
