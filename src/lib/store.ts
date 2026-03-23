import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedState, type AppState } from "@/lib/seed-data";
import type { CollectionSource, LeadCollectionRule, ReviewQueueItem, TenantSendPolicy } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "formpilot-state.json");

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
  const current = await readState();
  const next = await updater(current);
  await writeState(next);
  return next;
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
      id: `rule_${Date.now()}`,
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

