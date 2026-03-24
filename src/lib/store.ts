import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { buildSearchQueries, materializeCollectedCompanies } from "@/lib/collector";
import { simulateScan } from "@/lib/scanner";
import { seedState, type AppState } from "@/lib/seed-data";
import type { CollectionSource, LeadCollectionRule, ReviewQueueItem, TenantSendPolicy } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "formpilot-state.json");
let stateMutationQueue: Promise<void> = Promise.resolve();

function cloneSeedState(): AppState {
  return JSON.parse(JSON.stringify(seedState)) as AppState;
}

async function ensureStoreFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(cloneSeedState(), null, 2), "utf8");
  }
}

export async function readState(): Promise<AppState> {
  await ensureStoreFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as AppState;
}

export async function writeState(state: AppState) {
  await ensureStoreFile();
  await writeFile(dataFile, JSON.stringify(state, null, 2), "utf8");
}

export async function updateState(updater: (state: AppState) => AppState | Promise<AppState>) {
  let releaseQueue = () => {};
  const nextTurn = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });
  const previousTurn = stateMutationQueue;
  stateMutationQueue = nextTurn;

  await previousTurn;

  try {
    const current = await readState();
    const next = await updater(current);
    await writeState(next);
    return next;
  } finally {
    releaseQueue();
  }
}

export interface CreateRuleInput {
  name: string;
  industries: string[];
  regions: string[];
  keywords: string[];
  excludeTerms: string[];
  sources: CollectionSource[];
  runCadence: string;
}

export async function createCollectionRule(input: CreateRuleInput) {
  const now = new Date().toISOString();
  const state = await updateState((current) => {
    const rule: LeadCollectionRule = {
      id: `rule_${randomUUID()}`,
      tenantId: current.tenant.id,
      name: input.name,
      industries: input.industries,
      regions: input.regions,
      keywords: input.keywords,
      excludeTerms: input.excludeTerms,
      sources: input.sources,
      runCadence: input.runCadence,
      lastRunAt: now
    };

    return {
      ...current,
      rules: [rule, ...current.rules]
    };
  });

  return state.rules[0];
}

export async function runCollectionRule(ruleId: string) {
  let result:
    | {
        rule: LeadCollectionRule;
        collectedCount: number;
        queries: string[];
      }
    | undefined;

  await updateState((current) => {
    const rule = current.rules.find((item) => item.id === ruleId);
    if (!rule) {
      return current;
    }

    const queries = buildSearchQueries(rule);
    const companies = materializeCollectedCompanies(current.tenant.id, rule, current.companies);
    const now = new Date().toISOString();

    const updatedRule: LeadCollectionRule = {
      ...rule,
      lastRunAt: now
    };

    result = {
      rule: updatedRule,
      collectedCount: companies.length,
      queries
    };

    return {
      ...current,
      rules: current.rules.map((item) => (item.id === ruleId ? updatedRule : item)),
      companies: [...companies, ...current.companies],
      analytics: [
        ...companies.map((company, index) => ({
          id: `analytics_${randomUUID()}_${index}`,
          tenantId: current.tenant.id,
          type: "collected" as const,
          companyId: company.id,
          occurredAt: now
        })),
        ...current.analytics
      ]
    };
  });

  return result;
}

export async function scanCompany(companyId: string) {
  let result:
    | {
        companyId: string;
        sendReady: boolean;
        scanStatus: string;
      }
    | undefined;

  await updateState((current) => {
    const existing = current.companies.find((company) => company.id === companyId);
    if (!existing) {
      return current;
    }

    const scanned = simulateScan(existing);
    const now = new Date().toISOString();

    result = {
      companyId,
      sendReady: scanned.company.sendReady,
      scanStatus: scanned.company.scanStatus
    };

    return {
      ...current,
      companies: current.companies.map((company) => (company.id === companyId ? scanned.company : company)),
      scans: [scanned.scan, ...current.scans.filter((scan) => scan.companyId !== companyId)],
      forms: scanned.form ? [scanned.form, ...current.forms.filter((form) => form.companyId !== companyId)] : current.forms,
      snapshots: scanned.snapshot
        ? [scanned.snapshot, ...current.snapshots.filter((snapshot) => snapshot.companyId !== companyId)]
        : current.snapshots,
      reviews: scanned.review
        ? [scanned.review, ...current.reviews.filter((review) => review.companyId !== companyId)]
        : current.reviews.filter((review) => review.companyId !== companyId),
      analytics: [
        ...scanned.analyticsTypes.map((type, index) => ({
          id: `analytics_${randomUUID()}_${index}`,
          tenantId: current.tenant.id,
          type,
          companyId,
          occurredAt: now
        })),
        ...current.analytics
      ]
    };
  });

  return result;
}

export interface UpdateReviewInput {
  assignee?: string;
  detail?: string;
  retryAllowed?: boolean;
}

export async function updateReviewItem(id: string, input: UpdateReviewInput) {
  let updated: ReviewQueueItem | undefined;

  await updateState((current) => {
    const reviews = current.reviews.map((review) => {
      if (review.id !== id) {
        return review;
      }

      updated = {
        ...review,
        assignee: input.assignee ?? review.assignee,
        detail: input.detail ?? review.detail,
        retryAllowed: input.retryAllowed ?? review.retryAllowed
      };

      return updated;
    });

    return {
      ...current,
      reviews
    };
  });

  return updated;
}

export interface UpdatePolicyInput {
  timezone?: string;
  allowedWeekdays?: number[];
  startHour?: number;
  endHour?: number;
  blockJapaneseHolidays?: boolean;
  minHoursBetweenSends?: number;
}

export async function updateSendPolicy(input: UpdatePolicyInput) {
  let updated: TenantSendPolicy | undefined;

  await updateState((current) => {
    updated = {
      ...current.policy,
      ...input
    };

    return {
      ...current,
      policy: updated
    };
  });

  return updated;
}
