import Link from "next/link";
import { REPO_URL } from "@/lib/http";
import { Shell } from "../components/Shell";

// The story behind the prototype, for a reader who has five minutes. Every number is from
// reports/problem-statement.md (OIG figures) or poc/evals/REPORT.md; update them together.
const OIG = "https://oig.hhs.gov/documents/audit/11694/OEI-09-24-00331.pdf";

const SHORTLIST: [string, "Picked" | "Runner-up" | "Dropped", string][] = [
  ["Medicare Advantage denials of nursing home stays that are wrong but rarely appealed", "Picked", "Strongest government evidence, and a denial ends today without an action."],
  ["Admission rules that send most referrals to manual review", "Runner-up", "Real (funnily enough proved by this exercise), but it can be handled as a service."],
  ["Slow referral response loses the patient", "Dropped", "Copying the company's solution demonstrates nothing."],
  ["Under-leveled authorizations", "Dropped", "Public help articles show it's already shipped."],
];

const NO_LIST: [string, string][] = [
  ["General appeals drafting", "On the company's announced roadmap. Building it means guessing at their next release."],
  ["Hospital referrals and intake speed", "The core product. Nothing to add from the outside."],
  ["The request builder", "Stopping denials before they happen is the bigger prize, but it can't be validated on synthetic data. It's the next step."],
  ["Contesting every denial", "Some residents genuinely don't need skilled care. The queue says “don't contest” too."],
  ["Ranking by revenue", "No sourced dollar figure, and ranking residents by what they're worth reads badly."],
  ["Real patients or EHR data", "Everything is synthetic. Real public documents (Medicare's rules) only."],
  ["Legal judgments", "Outputs are drafts for a clinician and a compliance reviewer to approve."],
  ["A login", "There's no private data. Spend caps and a pre-generated fallback protect the demo instead."],
];

function Src({ href, children }: { href?: string; children: React.ReactNode }) {
  return href ? (
    <a className="src" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <span className="src">{children}</span>
  );
}

function Chapter({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="chapter">
      <span className="chapter-n" aria-hidden>
        {n}
      </span>
      <div className="chapter-body">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <Shell active="about">
      <main className="card card-page card-narrow story">
        <header className="top">
          <div>
            <h1>How we got here</h1>
            <p className="lede">
              We (me and my good buddy Claude) read public material on skilled nursing admissions, picked one problem, and built the smallest thing that could test it.
            </p>
            <p className="note">Independent work, not affiliated with or endorsed by any company. Every patient and letter in the app is synthetic.</p>
          </div>
        </header>

        <Chapter n={1} title="The brief">
          <p>
            A company&apos;s Toronto Product Manager posting says PMs &ldquo;create prototypes&rdquo;. So I wanted to prove it with one problem statement &rarr; one working
            prototype in half a weekend. I wanted it to be as real as possible, given the time &amp; data constraint.
          </p>
        </Chapter>

        <Chapter n={2} title="Where we looked">
          <div className="stats">
            <div>
              <strong>57</strong>
              <span>public company pages</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Summit 2026 talks</span>
            </div>
            <div>
              <strong>21</strong>
              <span>help-centre articles</span>
            </div>
            <div>
              <strong>5</strong>
              <span>outside sources (OIG, CMS, JAMA, JMIR, KFF)</span>
            </div>
          </div>
          <p>
            Government and peer-reviewed sources were the source of hard facts. The company&apos;s own material was the voice of the user/operator, and a reference for
            what&apos;s already solved.
          </p>
        </Chapter>

        <Chapter n={3} title="Meet the four candidates">
          <ul className="shortlist">
            {SHORTLIST.map(([problem, verdict, why]) => (
              <li key={problem}>
                <span className={`verdict verdict-${verdict === "Picked" ? "yes" : verdict === "Runner-up" ? "maybe" : "no"}`}>{verdict}</span>
                <div>
                  <strong>{problem}</strong>
                  <span>{why}</span>
                </div>
              </li>
            ))}
          </ul>
          <p>
            Why this pick: only <strong>18%</strong> of these denials are appealed, and <strong>95%</strong> of appeals win <Src href={OIG}>OIG 2026</Src>. Most wrong
            denials stand because nobody pushes back.
          </p>
        </Chapter>

        <Chapter n={4} title="Picking it apart even more">
          <p>
            General appeals tooling is already on the company&apos;s announced roadmap, so we looked for something that provides value but is less likely to be duplicate
            effort. Lucky for us, it was in one table of the OIG report.
          </p>
          <div className="big-stat">
            <div>
              <strong>39.5%</strong>
              <span>long-stay residents denied</span>
            </div>
            <span className="vs">vs</span>
            <div>
              <strong>11.5%</strong>
              <span>everyone else</span>
            </div>
            <p>
              Skilled nursing requests to 19 Medicare Advantage plans, June 2024 <Src href={OIG}>OIG 2026</Src>
            </p>
          </div>
          <ul className="bullets">
            <li>This was someone who has lived in a nursing home for months, gets sicker, and now needs daily skilled care in the building they already live in.</li>
            <li>
              <strong>The stated reasoning conflicts with Medicare&apos;s rules.</strong> Insurers told OIG residents &ldquo;already have some intermittent skilled therapy
              supports&rdquo;. But Medicare covers daily skilled <em>nursing</em>, not just therapy, and covers care that maintains rather than improves{" "}
              <Src>Medicare Benefit Policy Manual Ch. 8</Src>. Since 2024, these plans must apply the same criteria <Src>CMS-4201-F</Src>.
            </li>
            <li>
              <strong>The workflow doesn&apos;t fit.</strong> As we read the public help articles, the flow starts from a hospital referral. A resident who gets sicker in
              place has no natural starting point. (Our interpretation, not confirmed.)
            </li>
            <li>
              <strong>It&apos;s small</strong>, about 3% of requests <Src href={OIG}>OIG 2026</Src>. The value is per patient and per facility, not market size.
            </li>
          </ul>
          <blockquote className="reframe">
            <span>What people ask for</span>
            <p>Faster prior auth and appeals.</p>
            <span>What we think the problem is</span>
            <p>The request is framed like a hospital transfer, so the reviewer judges a resident against the wrong picture.</p>
          </blockquote>
        </Chapter>

        <Chapter n={5} title="What we built, and why this shape">
          <p>
            A prototype should test the riskiest assumption, not demo the whole product. Ours: <strong>can software tell which denials conflict with Medicare&apos;s rules?</strong>{" "}
            And since 82% of denials are never appealed, the bottleneck is attention, not writing. So it&apos;s a triage queue, not a &ldquo;paste a letter&rdquo; box.
          </p>
          <ol className="steps">
            <li>
              <strong>Read every letter.</strong> A small model (Jev) answers six yes/no questions about each denial in about a tenth of a second. Cheap enough to run on
              everything.
            </li>
            <li>
              <strong>Rank by what matters.</strong> Appeals due this week first, then by how likely the denial conflicts with the rules.
            </li>
            <li>
              <strong>Draft only the strong cases.</strong> Claude writes the draft; the server checks every citation, quote and chart fact, or falls back to a template. A
              person approves everything.
            </li>
          </ol>
          <div className="big-stat price">
            <div>
              <strong>$0.009</strong>
              <span>every Jev call we made, combined</span>
            </div>
            <div>
              <strong>160</strong>
              <span>letters read</span>
            </div>
            <div>
              <strong>234,403</strong>
              <span>tokens</span>
            </div>
            <p>
              Not even a cent for every run this weekend. That&apos;s about $0.00006 a letter: roughly 6x cheaper than Gemini Flash-Lite and 30x cheaper than Claude Haiku{" "}
              <Src>TypeSafe billing</Src> <Src>eval report</Src>. At that price, reading every denial costs nothing, and Claude is saved for the few drafts worth writing.
            </p>
          </div>
        </Chapter>

        <Chapter n={6} title="How we kept ourselves honest">
          <p>We wrote the rules, the questions and the test data, which makes it easy to fool ourselves. So:</p>
          <ul className="bullets">
            <li>120 test letters were written by a different model, and labelled blind by me, by hand.</li>
            <li>40 letters were sealed, the test plan was committed in advance, and the final run happened exactly once.</li>
            <li>Three baselines: keyword rules, Claude Haiku and Gemini Flash-Lite.</li>
          </ul>
          <div className="result">
            <p>
              Jev chose the right next step <strong>83%</strong> of the time against <strong>60%</strong> for keyword rules (p = 0.004), tied with both larger models, and ran
              6-9x faster. All 10 letters at the top of its queue were real rules conflicts.
            </p>
            <Link href="/evals">See the full results &rarr;</Link>
          </div>
          <p className="note">The letters are synthetic, so this says nothing yet about how often real denials look like this, or whether appeals succeed.</p>
        </Chapter>

        <Chapter n={7} title="What we said no to">
          <dl className="no-list">
            {NO_LIST.map(([what, why]) => (
              <div key={what}>
                <dt>{what}</dt>
                <dd>{why}</dd>
              </div>
            ))}
          </dl>
        </Chapter>

        <Chapter n={8} title="What would come next">
          <ul className="bullets">
            <li>
              <strong>Check the stack:</strong> Jev&apos;s privacy policies, terms and language support before any real letter goes near it.
            </li>
            <li>
              <strong>Implementation:</strong> the triage already runs behind a small REST API: <code>POST /api/v1/triage</code> reads one letter,{" "}
              <code>GET /api/v1/denials</code> returns the ranked queue, and <code>POST /api/v1/denials/&#123;id&#125;/appeal-drafts</code> returns a checked draft. It&apos;s
              rate-capped and rejects anything that looks like real patient data. Next is feeding it letters from a payer portal or EHR instead of the demo set.
            </li>
            <li>
              <strong>Pilot with one operator:</strong> denial rate for resident requests before and after, how many denials conflict with the rules, and how many of those get
              overturned.
            </li>
            <li>
              <strong>Build:</strong> a &ldquo;change in condition&rdquo; starting point and a request builder that answers the known objections before they&apos;re made.
            </li>
            <li>
              <strong>What would change my mind:</strong> if real resident denials mostly cite missing paperwork rather than residency or therapy, the triage is solving the
              wrong problem.
            </li>
          </ul>
          <p className="note">
            Built October 3-4, 2026. Decisions, sources and evals are in the <a href={REPO_URL}>repo</a>.
          </p>
        </Chapter>
      </main>
    </Shell>
  );
}
