"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Banner } from "@astryxdesign/core/Banner";
import type { DenialSummary } from "@/lib/api";
import type { Verdict } from "@/lib/check";
import { APPEAL_WINDOW_DAYS, type Case } from "@/lib/cases";
import type { Draft, Span } from "@/lib/draft";
import type { Action } from "@/lib/rules";
import type { Letter } from "@/lib/store";
import type { Triage } from "@/lib/triage";
import { formatDate, formatDue, joinOr, NEXT_STEP, REASON } from "@/lib/words";
import { daysText } from "../../components/DeadlineRing";
import { Icon, type IconName } from "../../components/Icon";

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
    </div>
  );
}

const ACTION_TAG: Record<Action, { label: string; tone: string }> = {
  rules_conflict: { label: "Not a Medicare criterion", tone: "green" },
  clinical_dispute: { label: "Clinical question", tone: "orange" },
  fixable: { label: "Fixable", tone: "blue" },
};
const VERDICT_ICON: Record<Verdict, IconName> = { contest_on_rules: "check", contest_on_facts: "help", send_documents: "doc", manual_review: "cancel" };
const pct = (p: number) => `${Math.round(p * 100)}%`;
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Assessment({ triage }: { triage: Triage }) {
  const found = triage.findings.filter((f) => f.detected).sort((a, b) => b.probability - a.probability);
  return (
    <div className="panel-body assess">
      <div className="assess-top">
        <span className={`assess-icon tone-${STAGE_TONE[triage.verdict]}`}>
          <Icon name={VERDICT_ICON[triage.verdict]} />
        </span>
        <div className="assess-verdict">
          <span className="eyebrow">Recommendation</span>
          <strong>{NEXT_STEP[triage.verdict].title}</strong>
        </div>
        {triage.verdict !== "manual_review" && (
          <div className="assess-score">
            <strong>{pct(triage.rules_conflict)}</strong>
            <span>Rules conflict</span>
          </div>
        )}
      </div>
      {found.length > 0 && (
        <>
          <span className="eyebrow">Reasons the plan gave</span>
          <ul className="reason-list">
            {found.map((f) => (
              <li key={f.label}>
                <span className="reason-text">{sentence(REASON[f.label])}</span>
                <span className={`tag tone-${ACTION_TAG[f.action].tone}`}>{ACTION_TAG[f.action].label}</span>
                <span className="reason-pct">{pct(f.probability)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {triage.handoff.needed && (
        <div className="callout">
          <Icon name="flag" className="flag" />
          <span>
            {triage.handoff.pivotal.length
              ? `Double-check: not sure whether the plan ${joinOr(triage.handoff.pivotal.map((l) => REASON[l]))}.`
              : "Double-check: no known reason found."}
          </span>
        </div>
      )}
    </div>
  );
}

// Public documents behind the citation names in lib/rules.ts (hash-locked, so the
// links live here).
const SOURCE_URLS: [string, string][] = [
  ["Medicare Benefit Policy Manual", "https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/bp102c08pdf.pdf"],
  ["CMS-4201-F", "https://www.cms.gov/newsroom/fact-sheets/2024-medicare-advantage-and-part-d-final-rule-cms-4201-f"],
];
const sourceUrl = (source: string) => SOURCE_URLS.find(([prefix]) => source.startsWith(prefix))?.[1];

export function DenialView(props: { summary: DenialSummary; letter: Letter; kase: Case | null; triage: Triage; draft: Draft | null }) {
  const { summary, letter, kase } = props;
  const [triage, setTriage] = useState(props.triage);
  const [draft, setDraft] = useState(props.draft);
  const [active, setActive] = useState<string | null>(null);
  const [running, setRunning] = useState<{ triage: boolean; draft: boolean }>({ triage: false, draft: false });
  const [live, setLive] = useState<{ triage_ms?: number; draft_ms?: number; cached?: boolean } | null>(null);
  const [fallbacks, setFallbacks] = useState<Fallback[]>([]);
  const [failed, setFailed] = useState<string | null>(null);
  const letterPane = useRef<HTMLDivElement>(null);

  const marks = useMemo(() => marksFor(draft), [draft]);
  const step = NEXT_STEP[triage.verdict];
  const busy = running.triage || running.draft;
  const deniedAgo = summary.days_left !== null ? APPEAL_WINDOW_DAYS - summary.days_left : null;

  const pick = (key: string) => {
    setActive(key);
    document.getElementById(`mark-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById(`block-${key}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  async function runLive() {
    setRunning({ triage: true, draft: true });
    setFallbacks([]);
    setFailed(null);
    try {
      const t = await post<{ live: boolean; triage?: Triage; fallback?: Fallback; error?: { message: string } }>("/api/v1/triage", { letter_id: letter.id });
      if (t.data.triage) setTriage(t.data.triage);
      const next: Fallback[] = t.data.fallback ? [t.data.fallback] : [];
      const status: { triage_ms?: number; draft_ms?: number; cached?: boolean } = t.data.live ? { triage_ms: t.data.triage?.latency_ms } : {};
      setFallbacks([...next]);
      setLive({ ...status });
      setRunning({ triage: false, draft: true });
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
      setRunning({ triage: false, draft: false });
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
          <span>Resident</span>
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
                <strong>{daysText(summary.days_left)}</strong>
                <span>Due {formatDue(summary.deadline)}</span>
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
          <button type="button" className="btn-primary" onClick={runLive} disabled={busy} title="Triage with Jev and draft with Claude now">
            {busy ? <span className="spinner" aria-hidden /> : <Icon name="play" />}
            {busy ? "Running" : "Run live"}
          </button>
        </div>
      </header>

      <div className="card tabs-card">
        <nav className="tabs" aria-label="Sections">
          <span className="tab tab-active">Denial Review</span>
        </nav>

        {(fallbacks.length > 0 || failed) && (
          <div className="notices">
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
              <span>{kase ? `Received ${formatDate(kase.denial.date)}` : "Demo letter"}</span>
            </div>
            <LetterText text={letter.text} marks={marks} active={active} onPick={pick} />
          </div>

          <div className="pane pane-draft">
            <section className="panel">
              <div className="panel-head">
                <strong>Denial Assessment</strong>
                <span>{live?.triage_ms !== undefined ? `Jev · live in ${live.triage_ms} ms` : "Jev"}</span>
              </div>
              {running.triage ? <Running what="Denial Assessment" /> : <Assessment triage={triage} />}
            </section>

            <section className="panel">
              <div className="panel-head">
                <strong>Reconsideration Draft</strong>
                <span>
                  {!draft ? "Not prepared" : draft.source === "claude" ? "Claude Haiku 4.5 · citations checked" : "Template"}
                  {live?.draft_ms !== undefined && ` · live in ${(live.draft_ms / 1000).toFixed(1)} s${live.cached ? " (cached)" : ""}`}
                  {draft?.fallback_reason === "check_failed" && " · Claude draft failed the citation check"}
                </span>
              </div>
              {running.draft ? (
                <Running what="Reconsideration Draft" />
              ) : !draft ? (
                <div className="panel-body">
                  <p className="muted">A person reads this one first.</p>
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
                      <p>
                        <span className="todo-tag">Not covered</span> “{t.text.replace(/\s+/g, " ")}”
                      </p>
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
                            {sourceUrl(s.source) ? (
                              <a className="source-name" href={sourceUrl(s.source)} target="_blank" rel="noreferrer">
                                {s.source}
                              </a>
                            ) : (
                              <span className="source-name">{s.source}</span>
                            )}
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
