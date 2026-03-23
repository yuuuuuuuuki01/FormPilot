import { AppShell } from "@/components/app-shell";
import { ReviewQueueClient } from "@/components/review-queue-client";
import { getDashboardData } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const data = await getDashboardData();

  return (
    <AppShell
      title="レビューキュー"
      description="自動送信を維持しつつ事故を抑えるための例外処理画面です。禁止文言曖昧、名寄せ曖昧、特殊フォームなどの危険ケースだけ人に戻します。"
    >
      <ReviewQueueClient reviews={data.reviews} />
    </AppShell>
  );
}
