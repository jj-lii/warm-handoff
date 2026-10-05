import Link from "next/link";
import { Icon, type IconName } from "./Icon";

// App frame in the layout of a SNF admissions tool: icon rail on the left, white cards
// on a blue-grey canvas (ADR 0023). Own wordmark; no ExaCare logo or name.
const NAV: { key: string; href: string; label: string; icon: IconName }[] = [
  { key: "about", href: "/about", label: "About", icon: "info" },
  { key: "queue", href: "/", label: "Denials", icon: "inbox" },
  { key: "evals", href: "/evals", label: "Evals", icon: "chart" },
];

export function Shell({ active, children }: { active: "about" | "queue" | "evals"; children: React.ReactNode }) {
  return (
    <div className="shell">
      <nav className="rail" aria-label="Main">
        <Link href="/" className="brand">
          <Icon name="shield" />
          <span className="rail-label">DENIAL CHECK</span>
        </Link>
        {NAV.map((n) => (
          <Link key={n.key} href={n.href} className={`rail-item${active === n.key ? " rail-active" : ""}`} aria-current={active === n.key ? "page" : undefined}>
            <Icon name={n.icon} />
            <span className="rail-label">{n.label}</span>
          </Link>
        ))}
        <div className="rail-user" title="Synthetic coordinator">
          <span className="avatar">KL</span>
          <span className="rail-label">
            Kyle Lowry
            <small>Coordinator</small>
          </span>
        </div>
      </nav>
      <div className="canvas">{children}</div>
    </div>
  );
}
