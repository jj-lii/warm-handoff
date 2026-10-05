"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HoverCard } from "@astryxdesign/core/HoverCard";
import type { DenialSummary } from "@/lib/api";
import type { Triage } from "@/lib/triage";
import { formatDate, joinOr, NEXT_STEP, REASON } from "@/lib/words";
import { StrengthChip, SuggestionChip } from "./Chips";
import { DeadlineRing, daysText } from "./DeadlineRing";
import { Icon } from "./Icon";

export function QueueRow({ d, triage, facility, deniedAgo }: { d: DenialSummary; triage: Triage; facility: string; deniedAgo: number }) {
  const router = useRouter();
  const found = triage.findings.filter((f) => f.detected);
  const unsure = triage.handoff.pivotal.map((l) => REASON[l]);
  const card = (
    <div className="card-body">
      <p>
        <strong>{NEXT_STEP[d.verdict].title}.</strong> {NEXT_STEP[d.verdict].detail}
      </p>
      {found.length > 0 && <p>The plan {joinOr(found.map((f) => REASON[f.label]))}.</p>}
      {d.double_check && (
        <p className="card-check">
          {unsure.length ? `Not sure whether the plan ${joinOr(unsure)}.` : "No known reason found."} Flagged by an untested rule (ADR 0018); a person approves every draft anyway.
        </p>
      )}
      <p className="card-numbers">Rules-conflict probability {d.rules_conflict.toFixed(2)} · Jev</p>
    </div>
  );
  return (
    <tr className="grid-row" onClick={() => router.push(`/denials/${d.id}`)}>
      <td>
        <Link href={`/denials/${d.id}`} className="name-link" onClick={(e) => e.stopPropagation()}>
          {d.member}
        </Link>
        {d.double_check && (
          <span className="flag" title="Double-check: an uncertain reason could change the next step">
            <Icon name="flag" />
          </span>
        )}
        <span className="sub">Denied {deniedAgo === 1 ? "1 day" : `${deniedAgo} days`} ago</span>
      </td>
      <td>{facility}</td>
      <td>
        Mng. Medicare
        <span className="sub">{d.plan}</span>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <HoverCard content={card} placement="below" alignment="start" label={`Why ${d.member} is here`}>
          <button type="button" className="chip-button">
            <SuggestionChip verdict={d.verdict} />
          </button>
        </HoverCard>
      </td>
      <td>{d.verdict.startsWith("contest") && <StrengthChip strength={d.strength} />}</td>
      <td>
        {d.days_left !== null && d.deadline && (
          <span className="due">
            <DeadlineRing daysLeft={d.days_left} />
            <span>
              {formatDate(d.deadline)}
              <span className="sub">{daysText(d.days_left)}</span>
            </span>
          </span>
        )}
      </td>
    </tr>
  );
}
