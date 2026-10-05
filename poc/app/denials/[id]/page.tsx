import { notFound } from "next/navigation";
import { summarize } from "@/lib/api";
import { caseFor, DRAFTS, letter, TRIAGE } from "@/lib/store";
import { DenialView } from "./DenialView";

export const dynamic = "force-dynamic";

export default async function DenialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = letter(id);
  const summary = summarize(id);
  if (!l || !summary) notFound();
  return <DenialView summary={summary} letter={l} kase={caseFor(id) ?? null} triage={TRIAGE[id]} draft={DRAFTS[id] ?? null} />;
}
