// The denial check: classify the reasons, map each to the rules, decide the next
// step, and assemble a rebuttal draft. Jev only answers yes/no questions; every
// sentence in the draft comes from rules.ts or the case's chart facts.
import { classify, detected, REVIEW_BAND, type Engine } from "./classify";
import { ACTION_ORDER, LABELS, RULES, type Action, type Citation, type Label } from "./rules";
import type { Case } from "./cases";

export type Finding = {
  label: Label;
  title: string;
  action: Action;
  probability: number;
  detected: boolean;
  needs_review: boolean;
  argument: string;
  citations: Citation[];
};

export type Verdict = "contest_on_rules" | "contest_on_facts" | "send_documents" | "manual_review";

const VERDICT: Record<Action, Verdict> = {
  rules_conflict: "contest_on_rules",
  clinical_dispute: "contest_on_facts",
  fixable: "send_documents",
};

const HEADLINE: Record<Verdict, string> = {
  contest_on_rules: "At least one stated reason is not a Medicare coverage criterion. Contest on the rules.",
  contest_on_facts: "The plan disputes the clinical need. Contest only if the chart shows daily skilled care.",
  send_documents: "The plan says information was missing. Send it and resubmit.",
  manual_review: "No known reason pattern found. A person should read this denial.",
};

export type CheckResult = {
  engine: Engine;
  model: string;
  verdict: Verdict;
  headline: string;
  findings: Finding[];
  draft: string | null;
  usage?: { input_tokens: number; output_tokens: number };
  latency_ms: number;
};

export async function checkDenial(text: string, engine: Engine, kase?: Case): Promise<CheckResult> {
  const c = await classify(text, engine);
  const hits = new Set(detected(c.probabilities));

  const findings: Finding[] = LABELS.map((l) => {
    const p = c.probabilities[l];
    return {
      label: l,
      title: RULES[l].title,
      action: RULES[l].action,
      probability: round(p),
      detected: hits.has(l),
      needs_review: engine === "jev" && p > REVIEW_BAND[0] && p < REVIEW_BAND[1],
      argument: RULES[l].argument,
      citations: RULES[l].citations,
    };
  }).sort((a, b) => b.probability - a.probability);

  const top = ACTION_ORDER.find((a) => findings.some((f) => f.detected && f.action === a));
  const verdict: Verdict = top ? VERDICT[top] : "manual_review";

  return {
    engine,
    model: c.model,
    verdict,
    headline: HEADLINE[verdict],
    findings,
    draft: verdict === "manual_review" ? null : draft(findings.filter((f) => f.detected), kase),
    usage: c.usage,
    latency_ms: c.latency_ms,
  };
}

function draft(found: Finding[], kase?: Case): string {
  const ordered = [...found].sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action));
  const sources: string[] = [];
  const cite = (c: Citation) => {
    const ref = c.quote ? `${c.source}: "${c.quote}"` : c.source;
    let i = sources.indexOf(ref);
    if (i === -1) i = sources.push(ref) - 1;
    return `[${i + 1}]`;
  };

  const lines = [
    "DRAFT for clinician and compliance review. Not a legal determination. Synthetic data only.",
    "",
    "Re: Request for reconsideration of a skilled nursing facility stay denial",
    `Member: ${kase?.member.name ?? "[member name]"}    Plan: ${kase?.plan ?? "[plan]"}    Denial dated: ${kase?.denial.date ?? "[date]"}`,
    "",
    "We ask the plan to reconsider. Its letter gives the reasons below; we address each in turn.",
  ];

  ordered.forEach((f, n) => {
    lines.push("", `${n + 1}. ${f.title}`, `${f.argument} ${f.citations.map(cite).join(" ")}`);
    if (f.action === "clinical_dispute") {
      lines.push(
        ...(kase
          ? kase.chart_facts.map((x) => `   - ${x.text} (${x.source})`)
          : ["   - [Add each skilled service, who must perform it, and how often, with chart references.]"]),
      );
    }
  });

  if (kase && !ordered.some((f) => f.action === "clinical_dispute")) {
    lines.push("", "The member's current skilled needs, from the chart:", ...kase.chart_facts.map((x) => `   - ${x.text} (${x.source})`));
  }

  lines.push("", "Sources", ...sources.map((s, i) => `[${i + 1}] ${s}`));
  return lines.join("\n");
}

const round = (p: number) => Math.round(p * 1000) / 1000;
