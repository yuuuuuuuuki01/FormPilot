import { AppShell } from "@/components/app-shell";
import { getDashboardData } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function CollectionRulesPage() {
  const data = await getDashboardData();

  return (
    <AppShell
      title="収集ルール"
      description="業種、地域、キーワード、除外語、取得元を管理してリスト取得ジョブを回す画面です。検索起点とディレクトリ起点の両方を MVP から扱います。"
    >
      <section className="cards">
        {data.rules.map((rule) => (
          <article key={rule.id} className="card">
            <p className="eyebrow">{rule.runCadence}</p>
            <h3>{rule.name}</h3>
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
            <p className="muted">キーワード: {rule.keywords.join(" / ")}</p>
            <p className="muted">除外語: {rule.excludeTerms.join(" / ")}</p>
            <p className="muted">
              取得元: {rule.sources.map((source) => (source === "search" ? "検索" : "ディレクトリ")).join(" + ")}
            </p>
            <p className="muted">最終実行: {rule.lastRunAt}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
