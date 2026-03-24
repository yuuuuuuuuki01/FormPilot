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
      title="Company / Form Collection"
      description="Use this screen to monitor collection, URL analysis, form discovery, and send readiness. Collected companies can be pushed directly into the form scan flow."
    >
      <section className="hero">
        <p className="eyebrow">MVP Focus</p>
        <h3>Collect company URLs first, then discover sendable forms automatically</h3>
        <p>
          Collection rules bring in candidate company URLs. From there, FormPilot runs form discovery, blocks risky cases,
          and surfaces only sendable targets.
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
          <h3 className="table-title">Recent Scheduled Meetings</h3>
          <div className="stack">
            {upcoming.map((meeting) => (
              <div key={meeting.id} className="note">
                <div className="inline-stats">
                  <strong>{meeting.companyName}</strong>
                  <span className="pill ok">Scheduled</span>
                </div>
                <p className="muted">
                  Booking URL: <span className="code">{meeting.bookingUrl}</span>
                </p>
                <p className="muted">Scheduled for: {meeting.scheduledFor}</p>
                <p className="muted">Owner: {meeting.ownerName}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="triple">
        <article className="card">
          <h3 className="section-title">Review Queue</h3>
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
          <h3 className="section-title">Blocked or Pending</h3>
          <div className="stack">
            {blockers.map((company) => (
              <div key={company.id} className="note">
                <strong>{company.name}</strong>
                <p className="muted">{company.blockReason ?? "Needs follow-up review."}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3 className="section-title">Blocked Phrase Library</h3>
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
