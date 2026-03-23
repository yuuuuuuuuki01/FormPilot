import { AppShell } from "@/components/app-shell";
import { CompanyCollectionTable } from "@/components/company-collection-table";
import {
  getBlockedPhrasesPreview,
  getCompaniesNeedingAction,
  getDashboardData,
  getPipelineSummary,
  getUpcomingMeetings
} from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  const pipeline = await getPipelineSummary();
  const upcoming = await getUpcomingMeetings();
  const blockers = await getCompaniesNeedingAction();

  return (
    <AppShell
      title="企業 / フォーム収集画面"
      description="収集、URL解析、フォーム抽出、送信可否の判定を一画面で把握するための MVP 主画面です。収集済み企業からそのままフォーム探索を実行できます。"
    >
      <section className="hero">
        <p className="eyebrow">MVP Focus</p>
        <h3>企業URLからフォーム情報までを自動取得し、送れる企業だけを前に出す</h3>
        <p>
          収集ルールで企業URL候補を取り込み、そのままフォーム探索へ流して送信可否を更新します。危険ケースだけレビューへ戻す形です。
        </p>
        <div className="hero-grid">
          {pipeline.map((item) => (
            <div key={item.label} className="hero-stat">
              <strong>{item.count}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="metrics">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <p className="eyebrow">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="muted">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="split">
        <CompanyCollectionTable companies={data.companies} />

        <article className="card">
          <h3 className="table-title">直近の商談化</h3>
          <div className="stack">
            {upcoming.map((meeting) => (
              <div key={meeting.id} className="note">
                <div className="inline-stats">
                  <strong>{meeting.companyName}</strong>
                  <span className="pill ok">日程確定</span>
                </div>
                <p className="muted">
                  予約URL: <span className="code">{meeting.bookingUrl}</span>
                </p>
                <p className="muted">確定日時: {meeting.scheduledFor}</p>
                <p className="muted">担当: {meeting.ownerName}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="triple">
        <article className="card">
          <h3 className="section-title">レビュー待ち</h3>
          <div className="stack">
            {data.reviews.map((review) => (
              <div key={review.id} className="note">
                <div className="inline-stats">
                  <strong>{review.subject}</strong>
                  <span className="pill warn">{review.reason}</span>
                </div>
                <p className="muted">{review.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3 className="section-title">送信停止候補</h3>
          <div className="stack">
            {blockers.map((company) => (
              <div key={company.id} className="note">
                <strong>{company.name}</strong>
                <p className="muted">{company.blockReason ?? "再確認が必要です。"}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3 className="section-title">禁止文言辞書</h3>
          <div className="stack">
            {getBlockedPhrasesPreview().map((phrase) => (
              <div key={phrase} className="note">
                <span className="code">{phrase}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
