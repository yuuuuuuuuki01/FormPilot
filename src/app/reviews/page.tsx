import { AppShell } from "@/components/app-shell";
import { getDashboardData, getReviewLabel } from "@/lib/domain";

export default function ReviewsPage() {
  const data = getDashboardData();

  return (
    <AppShell
      title="レビューキュー"
      description="自動送信を維持しつつ事故を抑えるための例外処理画面です。禁止文言曖昧、名寄せ曖昧、特殊フォームなどの危険ケースだけ人に戻します。"
    >
      <section className="cards">
        {data.reviews.map((review) => (
          <article key={review.id} className="card">
            <div className="inline-stats">
              <h3>{review.subject}</h3>
              <span className={`pill ${review.retryAllowed ? "warn" : "risk"}`}>{getReviewLabel(review)}</span>
            </div>
            <p className="muted">{review.detail}</p>
            <p className="muted">担当: {review.assignee ?? "未割当"}</p>
            <p className="muted">再実行: {review.retryAllowed ? "可能" : "不可"}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
