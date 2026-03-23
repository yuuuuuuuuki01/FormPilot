import { AppShell } from "@/components/app-shell";
import { getBlockedPhrasesPreview, getDashboardData } from "@/lib/domain";

export default function SettingsPage() {
  const data = getDashboardData();

  return (
    <AppShell
      title="設定"
      description="送信可能時間、祝日停止、禁止文言辞書、Gmail 連携、Google Calendar 連携を切り替える想定の設定画面です。MVP では値を可視化するところまで実装しています。"
    >
      <section className="split">
        <article className="card">
          <h3 className="table-title">送信ポリシー</h3>
          <div className="stack">
            <div className="note">
              <strong>タイムゾーン</strong>
              <p className="muted">{data.policy.timezone}</p>
            </div>
            <div className="note">
              <strong>営業時間</strong>
              <p className="muted">
                {data.policy.startHour}:00 - {data.policy.endHour}:00
              </p>
            </div>
            <div className="note">
              <strong>稼働曜日</strong>
              <p className="muted">{data.policy.allowedWeekdays.join(", ")}</p>
            </div>
            <div className="note">
              <strong>祝日停止</strong>
              <p className="muted">{data.policy.blockJapaneseHolidays ? "有効" : "無効"}</p>
            </div>
          </div>
        </article>
        <article className="card">
          <h3 className="table-title">禁止文言辞書</h3>
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
