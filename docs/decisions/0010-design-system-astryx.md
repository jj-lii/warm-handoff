# 0010 Design system: Astryx, themed with our own tokens
Status: accepted
Date: 2026-10-04
Context: The POC should read as a feature that could sit in ExaCare's Pre-Auth tab (document left, summary/criteria/citations right) without copying its brand. The author asked for a neutral library and delegated the pick after reviews.
Decision: Astryx (Meta, MIT, React 19 + StyleX, precompiled CSS), pinned to an exact 0.x version, themed with our own tokens. Borrow ExaCare's layout patterns, never its logo, name or exact styling.
Alternatives: shadcn/ui (owned code, but theming needs manual edits across hardcoded Tailwind classes); Carbon, Fluent 2, Primer (each carries a recognisable IBM/Microsoft/GitHub look); Polaris (Shopify-admin shaped, React library deprecated for web components).
Consequences: Public beta (0.x) with API churn, so pin the version and don't upgrade mid-build. Smaller ecosystem than shadcn. Next.js App Router compatibility is unconfirmed (V24); fallback is shadcn/ui. Sources: LogRocket and OpenReplay reviews, MarkTechPost launch coverage (July 2026).
