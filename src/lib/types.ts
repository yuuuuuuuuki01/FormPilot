export type Role = "admin" | "member";
export type CollectionSource = "search" | "directory";
export type ScanStatus = "queued" | "scanned" | "needs_review";
export type SendStatus =
  | "queued"
  | "parsing"
  | "review"
  | "blocked"
  | "sending"
  | "sent"
  | "failed";
export type ReviewReason =
  | "ambiguous_phrase"
  | "ambiguous_dedupe"
  | "special_form"
  | "copy_quality"
  | "delivery_risk";
export type ReplyClassification =
  | "positive"
  | "auto_reply"
  | "not_interested"
  | "reroute"
  | "schedule";

export interface Tenant {
  id: string;
  name: string;
  timezone: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  role: Role;
}

export interface TenantSendPolicy {
  tenantId: string;
  timezone: string;
  allowedWeekdays: number[];
  startHour: number;
  endHour: number;
  blockJapaneseHolidays: boolean;
  minHoursBetweenSends: number;
}

export interface LeadCollectionRule {
  id: string;
  tenantId: string;
  name: string;
  industries: string[];
  regions: string[];
  keywords: string[];
  excludeTerms: string[];
  sources: CollectionSource[];
  runCadence: string;
  lastRunAt: string;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  websiteUrl: string;
  industry: string;
  region: string;
  source: CollectionSource;
  dedupeKey: string;
  scanStatus: ScanStatus;
  formDetected: boolean;
  sendReady: boolean;
  blockReason?: string;
}

export interface CompanyAlias {
  id: string;
  tenantId: string;
  companyId: string;
  alias: string;
  domain: string;
  confidence: number;
}

export interface WebsiteScan {
  id: string;
  tenantId: string;
  companyId: string;
  discoveredPages: string[];
  contactCandidateUrls: string[];
  lastScannedAt: string;
  failureReason?: string;
}

export interface PageSnapshot {
  id: string;
  tenantId: string;
  companyId: string;
  formTargetId: string;
  surroundingText: string;
  confirmationText: string;
  textHash: string;
}

export interface FormTarget {
  id: string;
  tenantId: string;
  companyId: string;
  url: string;
  fields: string[];
  requiredFields: string[];
  hasConfirmationStep: boolean;
  sendAllowed: boolean;
  blockedPhraseDetected: boolean;
  lastSendAt?: string;
  failureReason?: string;
}

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  industry: string;
  body: string;
  variables: string[];
  qualityScore: number;
}

export interface OutreachJob {
  id: string;
  tenantId: string;
  companyId: string;
  formTargetId: string;
  status: SendStatus;
  stopCode?: string;
  scheduledAt: string;
}

export interface ReplyEvent {
  id: string;
  tenantId: string;
  outreachJobId: string;
  companyId: string;
  classification: ReplyClassification;
  summary: string;
  nextAction: string;
  receivedAt: string;
}

export interface Meeting {
  id: string;
  tenantId: string;
  companyId: string;
  bookingUrl: string;
  scheduledFor?: string;
  ownerName: string;
}

export interface Opportunity {
  id: string;
  tenantId: string;
  companyId: string;
  stage: "reply_waiting" | "booking_pending" | "scheduled";
  confidence: number;
  ownerName: string;
}

export interface ReviewQueueItem {
  id: string;
  tenantId: string;
  companyId: string;
  subject: string;
  reason: ReviewReason;
  detail: string;
  assignee?: string;
  retryAllowed: boolean;
}

export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  type:
    | "collected"
    | "scanned"
    | "form_detected"
    | "sent"
    | "reply"
    | "meeting_booked";
  companyId: string;
  occurredAt: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardData {
  tenant: Tenant;
  metrics: DashboardMetric[];
  rules: LeadCollectionRule[];
  companies: Company[];
  scans: WebsiteScan[];
  forms: FormTarget[];
  jobs: OutreachJob[];
  replies: ReplyEvent[];
  reviews: ReviewQueueItem[];
  meetings: Meeting[];
  opportunities: Opportunity[];
  policy: TenantSendPolicy;
}
