import { AppShell } from "@/components/app-shell";
import { getDashboardData, getReplyTone } from "@/lib/domain";

export default function RepliesPage() {
  const data = getDashboardData();

  return (
    <AppShell
      title="返信一覧"
      description="Gmail 同期で取得した返信を分類し、予約リンク送付や商談準備へつなぐ画面です。MVP では予約確定までを商談化とみなします。"
    >
      <section className="split">
        <article className="card">
          <h3 className="table-title">返信イベント</h3>
          <table className="table">
            <thead>
              <tr>
                <th>分類</th>
                <th>要約</th>
                <th>次アクション</th>
                <th>受信</th>
              </tr>
            </thead>
            <tbody>
              {data.replies.map((reply) => (
                <tr key={reply.id}>
                  <td>
                    <span className={`pill ${getReplyTone(reply.classification)}`}>{reply.classification}</span>
                  </td>
                  <td>{reply.summary}</td>
                  <td>{reply.nextAction}</td>
                  <td>{reply.receivedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="card">
          <h3 className="table-title">案件化状態</h3>
          <div className="stack">
            {data.opportunities.map((opportunity) => (
              <div key={opportunity.id} className="note">
                <div className="inline-stats">
                  <strong>{data.companies.find((company) => company.id === opportunity.companyId)?.name}</strong>
                  <span className="pill ok">{opportunity.stage}</span>
                </div>
                <p className="muted">担当: {opportunity.ownerName}</p>
                <p className="muted">確度: {Math.round(opportunity.confidence * 100)}%</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
