"use client";

import Link from "next/link";
import { Badge } from "@astryxdesign/core/Badge";
import { HoverCard } from "@astryxdesign/core/HoverCard";
import type { DenialSummary } from "@/lib/api";
import type { Triage } from "@/lib/triage";
import { formatDate, joinOr, NEXT_STEP, REASON } from "@/lib/words";
import { DeadlineRing, daysText } from "./DeadlineRing";

const STRENGTH_VARIANT = { "Strong case": "success", "Worth a look": "warning", Unlikely: "neutral" } as const;

export function QueueRow({ d, triage }: { d: DenialSummary; triage: Triage }) {
  const found = triage.findings.filter((f) => f.detected);
  const unsure = triage.handoff.pivotal.map((l) => REASON[l]);
  const card = (
    <div className="card-body">
      <p>
        <strong>{NEXT_STEP[d.verdict].title}.</strong> {NEXT_STEP[d.verdict].detail}
      </p>
      {found.length > 0 && <p>The plan {joinOr(found.map((f) => REASON[f.label]))}.</p>}
      {d.deadline && <p>Appeal due {formatDate(d.deadline)}.</p>}
      {d.double_check && (
        <p className="card-check">
          {unsure.length ? `Not sure whether the plan ${joinOr(unsure)}.` : "No known reason found."} Flagged by an untested rule (ADR 0018); a person approves every draft anyway.
        </p>
      )}
      <p className="card-numbers">Rules-conflict probability {d.rules_conflict.toFixed(2)} · Jev</p>
    </div>
  );
  return (
    <li className="row">
      <HoverCard content={card} placement="below" alignment="start" label={`Why ${d.member} is here`}>
        <Link href={`/denials/${d.id}`} className="row-link">
          {d.days_left !== null && <DeadlineRing daysLeft={d.days_left} />}
          <span className="row-main">
            <span className="row-name">{d.member}</span>
            <span className="row-sub">
              {d.plan}
              {d.days_left !== null && ` · ${daysText(d.days_left)}`}
            </span>
          </span>
          <span className="row-tags">
            {d.double_check && <Badge variant="purple" label="Double-check" />}
            {d.verdict.startsWith("contest") ? (
              <Badge variant={STRENGTH_VARIANT[d.strength]} label={d.strength} />
            ) : (
              <Badge variant="neutral" label={NEXT_STEP[d.verdict].title} />
            )}
          </span>
        </Link>
      </HoverCard>
    </li>
  );
}
