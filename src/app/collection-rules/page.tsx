import { AppShell } from "@/components/app-shell";
import { CollectionRuleForm } from "@/components/collection-rule-form";
import { CollectionRuleList } from "@/components/collection-rule-list";
import { getDashboardData } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function CollectionRulesPage() {
  const data = await getDashboardData();

  return (
    <AppShell
      title="収集ルール"
      description="業種、地域、キーワード、除外語、取得元を管理してリスト取得ジョブを回す画面です。ルール追加だけでなく、各ルールから企業URL候補の自動収集を即時実行できます。"
    >
      <section className="stack page-stack">
        <CollectionRuleForm />
      </section>
      <CollectionRuleList rules={data.rules} />
    </AppShell>
  );
}
