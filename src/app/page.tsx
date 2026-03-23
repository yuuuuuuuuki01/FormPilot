import { AppShell } from "@/components/app-shell";
import {
  getBlockedPhrasesPreview,
  getCompaniesNeedingAction,
  getDashboardData,
  getPipelineSummary,
  getSendReadiness,
  getUpcomingMeetings
} from "@/lib/domain";

export default function HomePage() {
  const data = getDashboardData();
  const pipeline = getPipelineSummary();
  const upcoming = getUpcomingMeetings();
  const blockers = getCompaniesNeedingAction();

  return (
    <AppShell
      title="企業 / フォーム収集画面"
      description="収集、URL解析、フォーム抽出、送信可否の判定を一画面で把握するための MVP 主画面です。営業担当はここで送信可能企業と要レビュー企業を見分けます。"
    >
      <section className="hero">
        <p className="eyebrow">MVP Focus</p>
        <h3>企業URLからフォーム情報までを自動取得し、送れる企業だけを前に出す</h3>
        <p>
          検索起点・ディレクトリ起点の両方で企業を集め、問い合わせ導線を解析し、営業禁止文言・時間帯・フォーム構造をチェックして送信可否を即時判定します。
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
        <article className="card">
          <h3 className="table-title">収集中の企業</h3>
          <table className="table">
            <thead>
              <tr>
                <th>企業</th>
                <th>取得元</th>
                <th>解析状態</th>
                <th>送信可否</th>
              </tr>
            </thead>
            <tbody>
              {data.companies.map((company) => {
                const readiness = getSendReadiness(company);
                const scanTone =
                  company.scanStatus === "scanned"
                    ? "ok"
                    : company.scanStatus === "queued"
                      ? "warn"
                      : "risk";
                return (
                  <tr key={company.id}>
                    <td>
                      <strong>{company.name}</strong>
                      <div className="muted">{company.websiteUrl}</div>
                    </td>
                    <td>{company.source === "search" ? "検索" : "ディレクトリ"}</td>
                    <td>
                      <span className={`pill ${scanTone}`}>{company.scanStatus}</span>
                    </td>
                    <td>
                      <span className={`pill ${readiness.tone}`}>{readiness.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>

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
