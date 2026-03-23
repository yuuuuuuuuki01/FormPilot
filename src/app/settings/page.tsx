import { AppShell } from "@/components/app-shell";
import { SettingsPolicyForm } from "@/components/settings-policy-form";
import { getBlockedPhrasesPreview, getDashboardData } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await getDashboardData();

  return (
    <AppShell
      title="設定"
      description="送信可能時間、祝日停止、禁止文言辞書、Gmail 連携、Google Calendar 連携を切り替える想定の設定画面です。MVP では送信ポリシーを UI から更新できます。"
    >
      <section className="split">
        <SettingsPolicyForm policy={data.policy} />
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
