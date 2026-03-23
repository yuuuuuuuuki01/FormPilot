"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CollectionSource } from "@/lib/types";

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CollectionRuleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [industries, setIndustries] = useState("");
  const [regions, setRegions] = useState("");
  const [keywords, setKeywords] = useState("");
  const [excludeTerms, setExcludeTerms] = useState("");
  const [runCadence, setRunCadence] = useState("平日 09:30");
  const [sources, setSources] = useState<CollectionSource[]>(["search", "directory"]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSource(source: CollectionSource) {
    setSources((current) =>
      current.includes(source) ? current.filter((item) => item !== source) : [...current, source]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/collection-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industries: parseList(industries),
          regions: parseList(regions),
          keywords: parseList(keywords),
          excludeTerms: parseList(excludeTerms),
          sources,
          runCadence
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "収集ルールの保存に失敗しました。");
        return;
      }

      setMessage("収集ルールを追加しました。");
      setName("");
      setIndustries("");
      setRegions("");
      setKeywords("");
      setExcludeTerms("");
      setRunCadence("平日 09:30");
      setSources(["search", "directory"]);
      router.refresh();
    });
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="inline-stats">
        <div>
          <p className="eyebrow">Create Rule</p>
          <h3>収集ルールを追加</h3>
        </div>
        <button className="button" type="submit" disabled={isPending || !name.trim() || sources.length === 0}>
          {isPending ? "保存中..." : "保存"}
        </button>
      </div>

      <label className="field">
        <span className="field-label">ルール名</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例: 大阪の建設業向け" />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field-label">業種</span>
          <input value={industries} onChange={(event) => setIndustries(event.target.value)} placeholder="士業, 製造" />
        </label>
        <label className="field">
          <span className="field-label">地域</span>
          <input value={regions} onChange={(event) => setRegions(event.target.value)} placeholder="東京, 神奈川" />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field-label">キーワード</span>
          <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="DX, 問い合わせ, 予約" />
        </label>
        <label className="field">
          <span className="field-label">除外語</span>
          <input value={excludeTerms} onChange={(event) => setExcludeTerms(event.target.value)} placeholder="採用, 個人向け" />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field-label">実行頻度</span>
          <input value={runCadence} onChange={(event) => setRunCadence(event.target.value)} placeholder="平日 09:30" />
        </label>
        <div className="field">
          <span className="field-label">取得元</span>
          <div className="checkbox-row">
            <label className="checkbox">
              <input type="checkbox" checked={sources.includes("search")} onChange={() => toggleSource("search")} />
              <span>検索</span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={sources.includes("directory")}
                onChange={() => toggleSource("directory")}
              />
              <span>ディレクトリ</span>
            </label>
          </div>
        </div>
      </div>

      {message ? <p className="feedback ok-text">{message}</p> : null}
      {error ? <p className="feedback risk-text">{error}</p> : null}
    </form>
  );
}
