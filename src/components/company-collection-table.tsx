"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Company } from "@/lib/types";

function getReadiness(company: Company) {
  if (!company.formDetected) {
    return { label: "Form not found", tone: "warn" as const };
  }
  if (company.sendReady) {
    return { label: "Ready to send", tone: "ok" as const };
  }
  return { label: company.blockReason ?? "Needs review", tone: "risk" as const };
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
        setError(payload?.error ?? "Form discovery failed.");
        return;
      }

      const payload = (await response.json()) as { scanStatus: string; sendReady: boolean };
      setMessage(payload.sendReady ? "Form discovery complete: send-ready" : `Form discovery complete: ${payload.scanStatus}`);
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
      <td>{company.source === "search" ? "Search" : "Directory"}</td>
      <td>
        <span className={`pill ${scanTone}`}>{company.scanStatus}</span>
      </td>
      <td>
        <span className={`pill ${readiness.tone}`}>{readiness.label}</span>
      </td>
      <td>
        <button className="button small-button" type="button" onClick={runScan} disabled={isPending}>
          {isPending ? "Scanning..." : "Run scan"}
        </button>
      </td>
    </tr>
  );
}

export function CompanyCollectionTable({ companies }: { companies: Company[] }) {
  return (
    <article className="card">
      <h3 className="table-title">Collected Companies</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Source</th>
            <th>Scan status</th>
            <th>Send readiness</th>
            <th>Action</th>
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
