import { readState } from "@/lib/store";
import type { Company, DashboardData, DashboardMetric, ReplyClassification, ReviewQueueItem } from "@/lib/types";

function ratio(part: number, whole: number) {
  if (whole === 0) {
    return "0%";
  }
  return `${Math.round((part / whole) * 100)}%`;
}

function companyNameById(companyId: string) {
  return readState().then((state) => state.companies.find((company) => company.id === companyId)?.name ?? companyId);
}

export async function getDashboardData(): Promise<DashboardData> {
  const state = await readState();
  const collected = state.analytics.filter((item) => item.type === "collected").length;
  const scanned = state.analytics.filter((item) => item.type === "scanned").length;
  const sent = state.analytics.filter((item) => item.type === "sent").length;
  const replied = state.analytics.filter((item) => item.type === "reply").length;
  const booked = state.analytics.filter((item) => item.type === "meeting_booked").length;

  const metrics: DashboardMetric[] = [
    { label: "取得数", value: String(collected), detail: `${state.rules.length} ルールから企業を取得` },
    { label: "解析成功率", value: ratio(scanned, collected), detail: `${scanned} / ${collected} 企業でURL解析完了` },
    { label: "送信数", value: String(sent), detail: `${state.jobs.filter((job) => job.status === "review").length} 件がレビュー待ち` },
    { label: "返信率", value: ratio(replied, sent), detail: `${replied} 件の返信を分類済み` },
    { label: "日程確定率", value: ratio(booked, replied), detail: `${booked} 件が予約リンク経由で確定` }
  ];

  return { ...state, metrics };
}

export function getSendReadiness(company: Company) {
  if (!company.formDetected) {
    return { label: "フォーム未発見", tone: "warn" as const };
  }
  if (company.sendReady) {
    return { label: "送信可能", tone: "ok" as const };
  }
  return { label: company.blockReason ?? "要レビュー", tone: "risk" as const };
}

export function getReplyTone(classification: ReplyClassification) {
  switch (classification) {
    case "positive":
    case "schedule":
      return "ok";
    case "reroute":
      return "warn";
    case "not_interested":
      return "risk";
    default:
      return "neutral";
  }
}

export function getReviewLabel(item: ReviewQueueItem) {
  switch (item.reason) {
    case "ambiguous_phrase":
      return "禁止文言";
    case "ambiguous_dedupe":
      return "名寄せ曖昧";
    case "special_form":
      return "特殊フォーム";
    case "copy_quality":
      return "文面品質";
    case "delivery_risk":
      return "送信事故懸念";
    default:
      return item.reason;
  }
}

export async function getPipelineSummary() {
  const state = await readState();
  return [
    { label: "送信待ち", count: state.jobs.filter((job) => job.status === "queued").length },
    { label: "レビュー待ち", count: state.jobs.filter((job) => job.status === "review").length + state.reviews.length },
    { label: "送信済み", count: state.jobs.filter((job) => job.status === "sent").length },
    { label: "返信あり", count: state.replies.length },
    { label: "日程確定", count: state.meetings.filter((meeting) => Boolean(meeting.scheduledFor)).length }
  ];
}

export function getBlockedPhrasesPreview() {
  return [
    "営業目的のご連絡はお断りします",
    "売り込み・宣伝に関する送信は禁止しています",
    "製品サポート以外のお問い合わせはご遠慮ください"
  ];
}

export async function getUpcomingMeetings() {
  const state = await readState();
  return Promise.all(
    state.meetings.map(async (meeting) => ({
    ...meeting,
    companyName: await companyNameById(meeting.companyId)
    }))
  );
}

export async function getCompaniesNeedingAction() {
  const state = await readState();
  return state.companies.filter((company) => !company.sendReady || company.scanStatus !== "scanned");
}
