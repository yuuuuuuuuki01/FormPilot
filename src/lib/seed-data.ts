import type {
  AnalyticsEvent,
  Company,
  CompanyAlias,
  DashboardData,
  FormTarget,
  LeadCollectionRule,
  Meeting,
  MessageTemplate,
  Opportunity,
  OutreachJob,
  PageSnapshot,
  ReplyEvent,
  ReviewQueueItem,
  Tenant,
  User,
  WebsiteScan
} from "@/lib/types";

const tenant: Tenant = {
  id: "tenant_formpilot_demo",
  name: "FormPilot Demo Team",
  timezone: "Asia/Tokyo"
};

const users: User[] = [
  { id: "user_1", tenantId: tenant.id, name: "Aki Tanaka", role: "admin" },
  { id: "user_2", tenantId: tenant.id, name: "Mio Sato", role: "member" }
];

const policy: DashboardData["policy"] = {
  tenantId: tenant.id,
  timezone: "Asia/Tokyo",
  allowedWeekdays: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 18,
  blockJapaneseHolidays: true,
  minHoursBetweenSends: 72
};

const rules: LeadCollectionRule[] = [
  {
    id: "rule_1",
    tenantId: tenant.id,
    name: "東京の士業向けDX",
    industries: ["士業", "コンサル"],
    regions: ["東京", "神奈川"],
    keywords: ["DX", "予約", "顧客管理"],
    excludeTerms: ["採用", "代理店募集"],
    sources: ["search", "directory"],
    runCadence: "毎朝 09:15",
    lastRunAt: "2026-03-22T09:15:00+09:00"
  },
  {
    id: "rule_2",
    tenantId: tenant.id,
    name: "製造業の問い合わせ導線あり企業",
    industries: ["製造", "部品"],
    regions: ["愛知", "静岡"],
    keywords: ["工場", "生産管理", "問い合わせ"],
    excludeTerms: ["個人向け", "採用"],
    sources: ["search", "directory"],
    runCadence: "平日 11:00",
    lastRunAt: "2026-03-21T11:00:00+09:00"
  }
];

const companies: Company[] = [
  {
    id: "company_1",
    tenantId: tenant.id,
    name: "Sakura Legal Partners",
    websiteUrl: "https://sakura-legal.example.jp",
    industry: "士業",
    region: "東京",
    source: "search",
    dedupeKey: "sakura-legal.example.jp",
    scanStatus: "scanned",
    formDetected: true,
    sendReady: true
  },
  {
    id: "company_2",
    tenantId: tenant.id,
    name: "Takumi Precision",
    websiteUrl: "https://takumi-precision.example.jp",
    industry: "製造",
    region: "愛知",
    source: "directory",
    dedupeKey: "takumi-precision.example.jp",
    scanStatus: "needs_review",
    formDetected: true,
    sendReady: false,
    blockReason: "営業禁止文言をフォーム周辺で検知"
  },
  {
    id: "company_3",
    tenantId: tenant.id,
    name: "Northfield Consulting",
    websiteUrl: "https://northfield-consulting.example.jp",
    industry: "コンサル",
    region: "神奈川",
    source: "search",
    dedupeKey: "northfield-consulting.example.jp",
    scanStatus: "queued",
    formDetected: false,
    sendReady: false,
    blockReason: "フォーム候補を再探索中"
  }
];

const aliases: CompanyAlias[] = [
  {
    id: "alias_1",
    tenantId: tenant.id,
    companyId: "company_1",
    alias: "さくら法律事務所",
    domain: "sakura-legal.example.jp",
    confidence: 0.98
  },
  {
    id: "alias_2",
    tenantId: tenant.id,
    companyId: "company_2",
    alias: "Takumi Precision Co., Ltd.",
    domain: "takumi-precision.example.jp",
    confidence: 0.82
  }
];

const scans: WebsiteScan[] = [
  {
    id: "scan_1",
    tenantId: tenant.id,
    companyId: "company_1",
    discoveredPages: ["/", "/about", "/contact", "/privacy"],
    contactCandidateUrls: ["https://sakura-legal.example.jp/contact"],
    lastScannedAt: "2026-03-22T10:02:00+09:00"
  },
  {
    id: "scan_2",
    tenantId: tenant.id,
    companyId: "company_2",
    discoveredPages: ["/", "/company", "/contact", "/recruit"],
    contactCandidateUrls: ["https://takumi-precision.example.jp/contact"],
    lastScannedAt: "2026-03-22T10:10:00+09:00"
  },
  {
    id: "scan_3",
    tenantId: tenant.id,
    companyId: "company_3",
    discoveredPages: ["/", "/company"],
    contactCandidateUrls: [],
    lastScannedAt: "2026-03-22T10:15:00+09:00",
    failureReason: "contact / inquiry 導線が見つからず再試行キューに移動"
  }
];

const forms: FormTarget[] = [
  {
    id: "form_1",
    tenantId: tenant.id,
    companyId: "company_1",
    url: "https://sakura-legal.example.jp/contact",
    fields: ["company", "name", "email", "message"],
    requiredFields: ["name", "email", "message"],
    hasConfirmationStep: true,
    sendAllowed: true,
    blockedPhraseDetected: false,
    lastSendAt: "2026-03-22T11:05:00+09:00"
  },
  {
    id: "form_2",
    tenantId: tenant.id,
    companyId: "company_2",
    url: "https://takumi-precision.example.jp/contact",
    fields: ["company", "department", "name", "phone", "message"],
    requiredFields: ["name", "phone", "message"],
    hasConfirmationStep: false,
    sendAllowed: false,
    blockedPhraseDetected: true,
    failureReason: "『営業目的のご連絡はお断りします』を検知"
  }
];

const snapshots: PageSnapshot[] = [
  {
    id: "snapshot_1",
    tenantId: tenant.id,
    companyId: "company_1",
    formTargetId: "form_1",
    surroundingText: "ご相談やご質問はこちらのフォームよりご連絡ください。",
    confirmationText: "内容をご確認のうえ送信してください。",
    textHash: "fp_demo_hash_1"
  },
  {
    id: "snapshot_2",
    tenantId: tenant.id,
    companyId: "company_2",
    formTargetId: "form_2",
    surroundingText: "営業目的のご連絡はお断りします。製品に関するお問い合わせのみ受け付けます。",
    confirmationText: "内容確認後に送信します。",
    textHash: "fp_demo_hash_2"
  }
];

const templates: MessageTemplate[] = [
  {
    id: "template_1",
    tenantId: tenant.id,
    name: "士業向け初回提案",
    industry: "士業",
    body: "{{company_name}} の問い合わせ導線と初回対応の効率化をご提案したくご連絡しました。",
    variables: ["company_name"],
    qualityScore: 92
  },
  {
    id: "template_2",
    tenantId: tenant.id,
    name: "製造業向け初回提案",
    industry: "製造",
    body: "{{company_name}} の商談前対応と日程調整の自動化をご提案したくご連絡しました。",
    variables: ["company_name"],
    qualityScore: 87
  }
];

const jobs: OutreachJob[] = [
  {
    id: "job_1",
    tenantId: tenant.id,
    companyId: "company_1",
    formTargetId: "form_1",
    status: "sent",
    scheduledAt: "2026-03-22T11:00:00+09:00"
  },
  {
    id: "job_2",
    tenantId: tenant.id,
    companyId: "company_2",
    formTargetId: "form_2",
    status: "blocked",
    stopCode: "blocked_phrase",
    scheduledAt: "2026-03-22T11:10:00+09:00"
  },
  {
    id: "job_3",
    tenantId: tenant.id,
    companyId: "company_3",
    formTargetId: "form_missing",
    status: "review",
    stopCode: "scan_retry",
    scheduledAt: "2026-03-22T11:30:00+09:00"
  }
];

const replies: ReplyEvent[] = [
  {
    id: "reply_1",
    tenantId: tenant.id,
    outreachJobId: "job_1",
    companyId: "company_1",
    classification: "positive",
    summary: "資料を見たうえで来週の打ち合わせを希望。",
    nextAction: "予約リンクを案内",
    receivedAt: "2026-03-22T13:20:00+09:00"
  },
  {
    id: "reply_2",
    tenantId: tenant.id,
    outreachJobId: "job_1",
    companyId: "company_1",
    classification: "schedule",
    summary: "4/2 14:00 で日程確定済み。",
    nextAction: "商談準備ブリーフを生成",
    receivedAt: "2026-03-22T14:05:00+09:00"
  }
];

const meetings: Meeting[] = [
  {
    id: "meeting_1",
    tenantId: tenant.id,
    companyId: "company_1",
    bookingUrl: "https://formpilot.example.local/bookings/sakura-legal",
    scheduledFor: "2026-04-02T14:00:00+09:00",
    ownerName: users[0].name
  }
];

const opportunities: Opportunity[] = [
  {
    id: "opp_1",
    tenantId: tenant.id,
    companyId: "company_1",
    stage: "scheduled",
    confidence: 0.78,
    ownerName: users[0].name
  }
];

const reviews: ReviewQueueItem[] = [
  {
    id: "review_1",
    tenantId: tenant.id,
    companyId: "company_2",
    subject: "Takumi Precision の問い合わせフォーム",
    reason: "ambiguous_phrase",
    detail: "フォーム周辺文言に営業拒否文言が含まれているため、送信を停止しました。",
    assignee: users[1].name,
    retryAllowed: false
  },
  {
    id: "review_2",
    tenantId: tenant.id,
    companyId: "company_3",
    subject: "Northfield Consulting のフォーム探索",
    reason: "special_form",
    detail: "問い合わせ導線が SPA 内に隠れており、自動抽出の再設計が必要です。",
    retryAllowed: true
  }
];

const analytics: AnalyticsEvent[] = [
  { id: "analytics_1", tenantId: tenant.id, type: "collected", companyId: "company_1", occurredAt: "2026-03-22T09:18:00+09:00" },
  { id: "analytics_2", tenantId: tenant.id, type: "collected", companyId: "company_2", occurredAt: "2026-03-22T09:21:00+09:00" },
  { id: "analytics_3", tenantId: tenant.id, type: "collected", companyId: "company_3", occurredAt: "2026-03-22T09:27:00+09:00" },
  { id: "analytics_4", tenantId: tenant.id, type: "scanned", companyId: "company_1", occurredAt: "2026-03-22T10:02:00+09:00" },
  { id: "analytics_5", tenantId: tenant.id, type: "form_detected", companyId: "company_1", occurredAt: "2026-03-22T10:03:00+09:00" },
  { id: "analytics_6", tenantId: tenant.id, type: "sent", companyId: "company_1", occurredAt: "2026-03-22T11:05:00+09:00" },
  { id: "analytics_7", tenantId: tenant.id, type: "reply", companyId: "company_1", occurredAt: "2026-03-22T13:20:00+09:00" },
  { id: "analytics_8", tenantId: tenant.id, type: "meeting_booked", companyId: "company_1", occurredAt: "2026-03-22T14:05:00+09:00" }
];

export interface AppState extends DashboardData {
  users: User[];
  aliases: CompanyAlias[];
  snapshots: PageSnapshot[];
  templates: MessageTemplate[];
  analytics: AnalyticsEvent[];
}

export const seedState: AppState = {
  tenant,
  metrics: [],
  policy,
  rules,
  companies,
  scans,
  forms,
  jobs,
  replies,
  reviews,
  meetings,
  opportunities,
  users,
  aliases,
  snapshots,
  templates,
  analytics
};
