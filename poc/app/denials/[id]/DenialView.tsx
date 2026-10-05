"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Banner } from "@astryxdesign/core/Banner";
import type { DenialSummary } from "@/lib/api";
import type { Verdict } from "@/lib/check";
import { APPEAL_WINDOW_DAYS, type Case } from "@/lib/cases";
import type { Draft, Span } from "@/lib/draft";
import type { Letter } from "@/lib/store";
import type { Triage } from "@/lib/triage";
import { formatDate, joinOr, NEXT_STEP, REASON } from "@/lib/words";
import { SyntheticChip } from "../../components/Chips";
import { daysText } from "../../components/DeadlineRing";
import { Icon } from "../../components/Icon";

type Fallback = { reason: string; message: string; repo: string };
type Mark = Span & { key: string; kind: "answer" | "todo" };

const STAGE_TONE: Record<Verdict, string> = { contest_on_rules: "green", contest_on_facts: "orange", send_documents: "blue", manual_review: "red" };

// Highlights in the letter: passages the draft answers and reasons left to the coordinator.
function marksFor(draft: Draft | null): Mark[] {
  if (!draft) return [];
  const all: Mark[] = [
    ...draft.blocks.flatMap((b, i) => (b.answers ? [{ ...b.answers, key: `b${i}`, kind: "answer" as const }] : [])),
    ...draft.coordinator_todos.map((t, i) => ({ ...t, key: `t${i}`, kind: "todo" as const })),
  ].sort((a, b) => a.start - b.start);
  const out: Mark[] = [];
  for (const m of all) if (!out.length || m.start >= out[out.length - 1].end) out.push(m);
  return out;
}

function LetterText({ text, marks, active, onPick }: { text: string; marks: Mark[]; active: string | null; onPick: (k: string) => void }) {
  const parts: React.ReactNode[] = [];
  let at = 0;
  for (const m of marks) {
    if (m.start > at) parts.push(text.slice(at, m.start));
    parts.push(
      <mark key={m.key} id={`mark-${m.key}`} className={`hl hl-${m.kind}${active === m.key ? " hl-active" : ""}`} onClick={() => onPick(m.key)}>
        {text.slice(m.start, m.end)}
      </mark>,
    );
    at = m.end;
  }
  parts.push(text.slice(at));
  return <pre className="letter">{parts}</pre>;
}

async function post<T>(url: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: (await res.json()) as T };
}

function Running({ what }: { what: string }) {
  return (
    <div className="running">
      <span className="spinner spinner-blue" aria-hidden />
      <strong>Running {what}</strong>
      <span>AI analysis takes a few seconds.</span>
    </div>
  );
}

export function DenialView(props: { summary: DenialSummary; letter: Letter; kase: Case | null; triage: Triage; draft: Draft | null }) {
  const { summary, letter, kase } = props;
  const [triage, setTriage] = useState(props.triage);
  const [draft, setDraft] = useState(props.draft);
  const [active, setActive] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<{ triage_ms?: number; draft_ms?: number; cached?: boolean } | null>(null);
  const [fallbacks, setFallbacks] = useState<Fallback[]>([]);
  const [failed, setFailed] = useState<string | null>(null);
  const letterPane = useRef<HTMLDivElement>(null);

  const marks = useMemo(() => marksFor(draft), [draft]);
  const found = triage.findings.filter((f) => f.detected);
  const step = NEXT_STEP[triage.verdict];
  const deniedAgo = summary.days_left !== null ? APPEAL_WINDOW_DAYS - summary.days_left : null;

  const pick = (key: string) => {
    setActive(key);
    document.getElementById(`mark-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById(`block-${key}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  async function runLive() {
    setRunning(true);
    setFallbacks([]);
    setFailed(null);
    try {
      const t = await post<{ live: boolean; triage?: Triage; fallback?: Fallback; error?: { message: string } }>("/api/v1/triage", { letter_id: letter.id });
      if (t.data.triage) setTriage(t.data.triage);
      const next: Fallback[] = t.data.fallback ? [t.data.fallback] : [];
      const status: { triage_ms?: number; draft_ms?: number; cached?: boolean } = t.data.live ? { triage_ms: t.data.triage?.latency_ms } : {};
      if ((t.data.triage ?? triage).verdict !== "manual_review") {
        const d = await post<{ live: boolean; cached?: boolean; draft?: Draft; fallback?: Fallback }>(`/api/v1/denials/${letter.id}/appeal-drafts`);
        if (d.data.draft) setDraft(d.data.draft);
        if (d.data.fallback) next.push(d.data.fallback);
        if (d.data.live) Object.assign(status, { draft_ms: d.data.draft?.latency_ms, cached: d.data.cached });
      }
      setFallbacks(next);
      setLive(status);
    } catch {
      setFailed("Couldn't reach the server. The pre-generated result is still shown.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="detail">
      <header className="card patient-bar">
        <Link href="/" className="icon-button" aria-label="Back to the queue">
          <Icon name="back" />
        </Link>
        <div className="field">
          <strong>{summary.member}</strong>
          <span>Synthetic resident</span>
        </div>
        {kase ? (
          <>
            <div className="field">
              <strong>{deniedAgo === 1 ? "1 day" : `${deniedAgo} days`} ago</strong>
              <span>Denied {formatDate(kase.denial.date)}</span>
            </div>
            <div className="field">
              <strong>{kase.facility}</strong>
              <span>Facility</span>
            </div>
            <div className="field">
              <strong>{kase.plan}</strong>
              <span>Payer</span>
            </div>
            {summary.deadline && summary.days_left !== null && (
              <div className="field">
                <strong>{formatDate(summary.deadline)}</strong>
                <span>Appeal due · {daysText(summary.days_left)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="field">
            <strong>Outside the queue</strong>
            <span>No chart facts or deadline</span>
          </div>
        )}
        <div className="field">
          <span className={`stage tone-${STAGE_TONE[triage.verdict]}`}>{step.title}</span>
          <span>AI Suggestion</span>
        </div>
        <div className="bar-end">
          <SyntheticChip />
          <button type="button" className="btn-primary" onClick={runLive} disabled={running} title="Triage with Jev and draft with Claude now, instead of the pre-generated result">
            {running ? <span className="spinner" aria-hidden /> : <Icon name="play" />}
            {running ? "Running" : "Run live"}
          </button>
        </div>
      </header>

      <div className="card tabs-card">
        <nav className="tabs" aria-label="Sections">
          <span className="tab tab-active">Denial Review</span>
          <Link href="/evals" className="tab">
            Evals
          </Link>
        </nav>

        {(live || fallbacks.length > 0 || failed) && (
          <div className="notices">
            {live && (live.triage_ms !== undefined || live.draft_ms !== undefined) && (
              <p className="live-note">
                Live:{live.triage_ms !== undefined && ` Jev triage ${live.triage_ms} ms`}
                {live.draft_ms !== undefined && ` · Claude draft ${(live.draft_ms / 1000).toFixed(1)} s${live.cached ? " (cached earlier today)" : ""}`}
              </p>
            )}
            {fallbacks.slice(0, 1).map((f) => (
              <Banner
                key={f.reason}
                status="warning"
                title="Showing the pre-generated result"
                description={f.message}
                endContent={
                  <a href={f.repo} target="_blank" rel="noreferrer">
                    Repo
                  </a>
                }
              />
            ))}
            {failed && <Banner status="error" title={failed} />}
          </div>
        )}

        <div className="panes">
          <div className="pane pane-letter" ref={letterPane}>
            <div className="doc-head">
              <strong>{summary.member} - denial notice.txt</strong>
              <span>{kase ? `Received ${formatDate(kase.denial.date)}` : "Demo letter"} · synthetic</span>
              <span className="doc-note">Dates inside the letter are as generated; the queue sets its own denial dates so deadlines stay current.</span>
            </div>
            <LetterText text={letter.text} marks={marks} active={active} onPick={pick} />
          </div>

          <div className="pane pane-draft">
            <h2 className="step">Review the denial and the draft appeal</h2>

            <section className="panel">
              <div className="panel-head">
                <strong>Denial Assessment</strong>
                <span>Triage by Jev · rules-conflict probability {triage.rules_conflict.toFixed(2)}</span>
              </div>
              {running ? (
                <Running what="Denial Assessment" />
              ) : (
                <div className="panel-body">
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                  {found.length > 0 && (
                    <ul className="reasons">
                      {found.map((f) => (
                        <li key={f.label}>
                          The plan {REASON[f.label]}.{" "}
                          <span className="muted">{f.action === "rules_conflict" ? "Not a coverage criterion." : f.action === "clinical_dispute" ? "A clinical question." : "Fixable."}</span>{" "}
                          <span className="num">{f.probability.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {triage.handoff.needed && (
                    <p className="check">
                      <Icon name="flag" className="flag" />
                      <span>
                        {triage.handoff.pivotal.length
                          ? `Not sure whether the plan ${joinOr(triage.handoff.pivotal.map((l) => REASON[l]))}; the answer changes the next step.`
                          : "No known reason found."}{" "}
                        <span className="muted">Untested rule (ADR 0018).</span>
                      </span>
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <strong>Reconsideration Draft</strong>
                <span>
                  {!draft
                    ? "Not prepared"
                    : draft.source === "claude"
                      ? "Wording by Claude Haiku 4.5. Every citation, chart fact and quote was checked against its source by the server."
                      : "Template draft: every sentence comes from the rules file or the chart."}
                  {draft?.fallback_reason === "check_failed" && " (A Claude draft failed the citation check, so the template is shown.)"}
                </span>
              </div>
              {running ? (
                <Running what="Reconsideration Draft" />
              ) : !draft ? (
                <div className="panel-body">
                  <p className="muted">A person should read this letter first; no draft is prepared when no known reason is found.</p>
                </div>
              ) : (
                <div className="panel-body draft">
                  <p className="draft-header">{draft.header}</p>
                  {draft.blocks.map((b, i) => {
                    const key = `b${i}`;
                    return (
                      <div
                        key={key}
                        id={`block-${key}`}
                        className={`block${b.answers ? " block-linked" : ""}${active === key ? " block-active" : ""}`}
                        onClick={() => b.answers && pick(key)}
                      >
                        <p>
                          {b.text}
                          {b.cites.map((n) => (
                            <a key={n} href={`#source-${n}`} className="cite" onClick={(e) => e.stopPropagation()}>
                              {n}
                            </a>
                          ))}
                        </p>
                        {b.answers && <p className="answers">Answers: “{b.answers.text.replace(/\s+/g, " ")}”</p>}
                        {b.facts.length > 0 && (
                          <ul className="facts">
                            {b.facts.map((f) => (
                              <li key={f.id}>
                                Chart: {f.text} <span className="muted">({f.source})</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  {draft.coordinator_todos.map((t, i) => (
                    <div key={`t${i}`} id={`block-t${i}`} className={`block block-todo${active === `t${i}` ? " block-active" : ""}`} onClick={() => pick(`t${i}`)}>
                      <p>Coordinator: address “{t.text.replace(/\s+/g, " ")}”. None of the six known reasons covers it.</p>
                    </div>
                  ))}
                  <div className="citations">
                    <div className="citations-head">
                      <Icon name="sparkle" className="sparkle" />
                      <strong>Citations</strong>
                      <span className="badge-count">{draft.sources.length}</span>
                    </div>
                    <ol className="sources">
                      {draft.sources.map((s) => (
                        <li key={s.n} id={`source-${s.n}`}>
                          <span className="cite-num">{s.n}</span>
                          <span>
                            <span className="source-name">{s.source}</span>
                            {s.quote && <q>{s.quote}</q>}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
