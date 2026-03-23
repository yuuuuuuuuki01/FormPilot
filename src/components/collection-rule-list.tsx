"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LeadCollectionRule } from "@/lib/types";

function RuleCard({ rule }: { rule: LeadCollectionRule }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function runCollection() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/collection-rules/${rule.id}/collect`, {
        method: "POST"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "企業URL収集に失敗しました。");
        return;
      }

      const payload = (await response.json()) as { collectedCount: number; queries: string[] };
      setMessage(`${payload.collectedCount} 件の企業候補を追加しました`);
      router.refresh();
    });
  }

  return (
    <article className="card">
      <div className="inline-stats">
        <div>
          <p className="eyebrow">{rule.runCadence}</p>
          <h3>{rule.name}</h3>
        </div>
        <button className="button" type="button" onClick={runCollection} disabled={isPending}>
          {isPending ? "収集中..." : "今すぐ収集"}
        </button>
      </div>
      <div className="pill-row">
        {rule.industries.map((industry) => (
          <span key={industry} className="pill neutral">
            {industry}
          </span>
        ))}
        {rule.regions.map((region) => (
          <span key={region} className="pill ok">
            {region}
          </span>
        ))}
      </div>
      <p className="muted">キーワード: {rule.keywords.join(" / ") || "-"}</p>
      <p className="muted">除外語: {rule.excludeTerms.join(" / ") || "-"}</p>
      <p className="muted">
        取得元: {rule.sources.map((source) => (source === "search" ? "検索" : "ディレクトリ")).join(" + ")}
      </p>
      <p className="muted">最終実行: {rule.lastRunAt}</p>
      {message ? <p className="feedback ok-text">{message}</p> : null}
      {error ? <p className="feedback risk-text">{error}</p> : null}
    </article>
  );
}

export function CollectionRuleList({ rules }: { rules: LeadCollectionRule[] }) {
  return (
    <section className="cards">
      {rules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} />
      ))}
    </section>
  );
}
