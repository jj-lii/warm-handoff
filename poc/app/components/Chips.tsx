import type { Verdict } from "@/lib/check";
import type { Strength } from "@/lib/queue";
import { Icon, type IconName } from "./Icon";

// Outlined chip with a coloured icon: the AI's suggested next step.
const SUGGESTION: Record<Verdict, { label: string; icon: IconName; tone: string }> = {
  contest_on_rules: { label: "Contest", icon: "check", tone: "green" },
  contest_on_facts: { label: "Contest on facts", icon: "help", tone: "orange" },
  send_documents: { label: "Send records", icon: "doc", tone: "blue" },
  manual_review: { label: "Needs review", icon: "cancel", tone: "red" },
};

export function SuggestionChip({ verdict }: { verdict: Verdict }) {
  const s = SUGGESTION[verdict];
  return (
    <span className={`chip chip-outline tone-${s.tone}`}>
      <Icon name={s.icon} />
      {s.label}
    </span>
  );
}

// Solid chip: how strong the case is.
const STRENGTH_TONE: Record<Strength, string> = { "Strong case": "green", "Worth a look": "orange", Unlikely: "gray" };

export function StrengthChip({ strength }: { strength: Strength }) {
  return <span className={`chip chip-solid tone-${STRENGTH_TONE[strength]}`}>{strength}</span>;
}
