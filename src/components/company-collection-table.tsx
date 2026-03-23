"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Company } from "@/lib/types";

function getReadiness(company: Company) {
  if (!company.formDetected) {
    return { label: "フォーム未発見", tone: "warn" as const };
  }
  if (company.sendReady) {
    return { label: "送信可能", tone: "ok" as const };
  }
  return { label: company.blockReason ?? "要レビュー", tone: "risk" as const };
}

function CompanyRow({ company }: { company: Company }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const readiness = getReadiness(company);
  const scanTone =
    company.scanStatus === "scanned" ? "ok" : company.scanStatus === "queued" ? "warn" : "risk";

  function runScan() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/companies/${company.id}/scan`, {
        method: "POST"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "フォーム探索に失敗しました。");
        return;
      }

      const payload = (await response.json()) as { scanStatus: string; sendReady: boolean };
      setMessage(payload.sendReady ? "フォーム探索完了: 送信可能です" : `フォーム探索完了: ${payload.scanStatus}`);
      router.refresh();
    });
  }

  return (
    <tr>
      <td>
        <strong>{company.name}</strong>
        <div className="muted">{company.websiteUrl}</div>
        {message ? <div className="feedback ok-text">{message}</div> : null}
        {error ? <div className="feedback risk-text">{error}</div> : null}
      </td>
      <td>{company.source === "search" ? "検索" : "ディレクトリ"}</td>
      <td>
        <span className={`pill ${scanTone}`}>{company.scanStatus}</span>
      </td>
      <td>
        <span className={`pill ${readiness.tone}`}>{readiness.label}</span>
      </td>
      <td>
        <button className="button small-button" type="button" onClick={runScan} disabled={isPending}>
          {isPending ? "探索中..." : "フォーム探索"}
        </button>
      </td>
    </tr>
  );
}

export function CompanyCollectionTable({ companies }: { companies: Company[] }) {
  return (
    <article className="card">
      <h3 className="table-title">収集中の企業</h3>
      <table className="table">
        <thead>
          <tr>
            <th>企業</th>
            <th>取得元</th>
            <th>解析状態</th>
            <th>送信可否</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <CompanyRow key={company.id} company={company} />
          ))}
        </tbody>
      </table>
    </article>
  );
}
