import { STRENGTH, URGENT_DAYS } from "@/lib/queue";
import { HANDOFF_BAND } from "@/lib/handoff";
import { SyntheticChip } from "../components/Chips";
import { Shell } from "../components/Shell";

// Static summary of poc/evals/REPORT.md (holdout run once, 2026-10-04). Every number
// here is copied from that report; update both together.
const HOLDOUT: [string, string, string, string, string][] = [
  ["Right next step", "60%", "83%", "85%", "83%"],
  ["Contestable denials caught", "81%", "96%", "96%", "96%"],
  ["Wrongly contested", "32%", "19%", "17%", "19%"],
  ["Sent to a person (evaluated rule)", "20%", "13%", "13%", "53%"],
  ["Precision, top 10 of queue", "68%", "70%", "83%", "100%"],
];

export default function EvalsPage() {
  return (
    <Shell active="evals">
    <main className="card card-page card-narrow">
      <header className="top">
        <div>
          <h1>How well does the triage work?</h1>
          <p className="lede">
            A pre-registered test on 40 synthetic denial letters the engines never saw during tuning, run once. Full method and caveats in{" "}
            <code>poc/evals/REPORT.md</code>.
          </p>
        </div>
        <SyntheticChip label="Synthetic letters" />
      </header>

      <section className="section">
        <h2>Holdout results (n = 40)</h2>
        <table className="table">
          <thead>
            <tr>
              <th />
              <th>Keyword</th>
              <th>Claude Haiku</th>
              <th>Gemini Flash-Lite</th>
              <th>Jev (used here)</th>
            </tr>
          </thead>
          <tbody>
            {HOLDOUT.map(([m, ...v]) => (
              <tr key={m}>
                <th scope="row">{m}</th>
                {v.map((x, i) => (
                  <td key={i}>{x}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="bullets">
          <li>Jev beat the keyword baseline on the right next step (p = 0.004). Jev, Haiku and Gemini were statistically indistinguishable at n = 40.</li>
          <li>Jev answered in 124 ms (median) against 800 ms for Gemini and 1,125 ms for Haiku.</li>
          <li>
            Most model errors are one ambiguity named before the run: &ldquo;care can be provided by custodial staff&rdquo; reads either as &ldquo;the care isn&apos;t
            skilled&rdquo; or &ldquo;the care she already gets will do&rdquo;.
          </li>
        </ul>
      </section>

      <section className="section">
        <h2>What the app adds that wasn&apos;t tested</h2>
        <ul className="bullets">
          <li>
            <strong>Double-check rule.</strong> The app flags a letter only when an uncertain reason (probability {HANDOFF_BAND[0]}-{HANDOFF_BAND[1]}) could change
            the next step (ADR 0018). Found after the holdout ran: on the holdout it would have flagged 7 letters (18%) instead of 21. Untested on fresh letters.
          </li>
          <li>
            <strong>Ranking.</strong> Appeals due within {URGENT_DAYS} days come first; each band is sorted by rules-conflict probability. &ldquo;Strong case&rdquo;
            means at least {STRENGTH.strong}; &ldquo;Worth a look&rdquo; at least {STRENGTH.possible}. The cut-offs are product choices, not measured.
          </li>
          <li>
            <strong>Drafts.</strong> Claude&apos;s wording is not evaluated. What is enforced: every citation comes from the rules file, every chart fact from the case,
            and every quote from the letter, or the draft falls back to the template.
          </li>
          <li>
            <strong>Demo queue.</strong> The letters on the queue are from the dev set, which Jev&apos;s questions were tuned on, so the demo shows its best case.
          </li>
        </ul>
      </section>
    </main>
    </Shell>
  );
}
