// Plain-language wording for the UI. The arguments and citations themselves come from
// rules.ts; these are only short labels for rows and cards.
import type { Verdict } from "./check";
import type { Label } from "./rules";

export const REASON: Record<Label, string> = {
  residency: "points to the member's long-term stay at the facility",
  therapy_participation: "doubts the member can take part in daily therapy",
  no_improvement: "says the member isn't expected to improve",
  custodial_substitute: "says the care the member already gets will do",
  no_daily_skilled_need: "says the care isn't skilled or isn't needed daily",
  missing_documentation: "says records were missing",
};

export const NEXT_STEP: Record<Verdict, { title: string; detail: string }> = {
  contest_on_rules: { title: "Contest on the rules", detail: "At least one stated reason is not a Medicare coverage criterion." },
  contest_on_facts: { title: "Contest on the facts", detail: "The plan disputes the clinical need. Contest only if the chart shows daily skilled care." },
  send_documents: { title: "Send the records", detail: "The plan says information was missing. Send it and resubmit." },
  manual_review: { title: "A person reads it", detail: "No known reason pattern found." },
};

export function joinOr(parts: string[]): string {
  return parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} or ${parts[parts.length - 1]}`;
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });

// "October 9th"
export function formatDue(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const n = d.getUTCDate();
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${d.toLocaleDateString("en-CA", { month: "long", timeZone: "UTC" })} ${n}${suffix}`;
}
