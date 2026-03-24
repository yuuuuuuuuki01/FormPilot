import { randomUUID } from "node:crypto";
import type { Company, FormTarget, PageSnapshot, ReviewQueueItem, WebsiteScan } from "@/lib/types";

export interface ScanResult {
  company: Company;
  scan: WebsiteScan;
  form?: FormTarget;
  snapshot?: PageSnapshot;
  review?: ReviewQueueItem;
  analyticsTypes: Array<"scanned" | "form_detected">;
}

function buildId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function normalizeSignals(company: Company) {
  return [company.name, company.industry, company.region, company.websiteUrl, company.dedupeKey]
    .join(" ")
    .toLowerCase();
}

function hasAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function classifyOutcome(company: Company) {
  const signals = normalizeSignals(company);

  if (hasAny(signals, ["manufact", "factory", "precision", "seizou", "製造"])) {
    return "blocked_phrase" as const;
  }

  if (hasAny(signals, ["consult", "advis", "strategy", "studio", "creative"])) {
    return "special_form" as const;
  }

  return "send_ready" as const;
}

export function simulateScan(company: Company): ScanResult {
  const scannedAt = new Date().toISOString();
  const outcome = classifyOutcome(company);
  const baseScan: WebsiteScan = {
    id: buildId("scan"),
    tenantId: company.tenantId,
    companyId: company.id,
    discoveredPages: ["/", "/about", "/contact", "/privacy"],
    contactCandidateUrls: [`${company.websiteUrl}/contact`],
    lastScannedAt: scannedAt
  };

  if (outcome === "blocked_phrase") {
    const form: FormTarget = {
      id: buildId("form"),
      tenantId: company.tenantId,
      companyId: company.id,
      url: `${company.websiteUrl}/contact`,
      fields: ["company", "name", "email", "message"],
      requiredFields: ["name", "email", "message"],
      hasConfirmationStep: false,
      sendAllowed: false,
      blockedPhraseDetected: true,
      failureReason: "Blocked by forbidden outreach wording"
    };

    const snapshot: PageSnapshot = {
      id: buildId("snapshot"),
      tenantId: company.tenantId,
      companyId: company.id,
      formTargetId: form.id,
      surroundingText: "Sales inquiries are not accepted. Only product-related contact is supported.",
      confirmationText: "Confirm the details before submitting.",
      textHash: buildId("hash")
    };

    const review: ReviewQueueItem = {
      id: buildId("review"),
      tenantId: company.tenantId,
      companyId: company.id,
      subject: `${company.name} form review`,
      reason: "ambiguous_phrase",
      detail: "Detected wording that suggests outreach is not allowed. Route this company to review instead of sending automatically.",
      retryAllowed: false
    };

    return {
      company: {
        ...company,
        scanStatus: "needs_review",
        formDetected: true,
        sendReady: false,
        blockReason: "Blocked by forbidden outreach wording"
      },
      scan: baseScan,
      form,
      snapshot,
      review,
      analyticsTypes: ["scanned", "form_detected"]
    };
  }

  if (outcome === "special_form") {
    return {
      company: {
        ...company,
        scanStatus: "needs_review",
        formDetected: false,
        sendReady: false,
        blockReason: "Form path needs manual review due to a dynamic or non-standard contact flow"
      },
      scan: {
        ...baseScan,
        discoveredPages: ["/", "/company"],
        contactCandidateUrls: [],
        failureReason: "No static contact/inquiry path found"
      },
      review: {
        id: buildId("review"),
        tenantId: company.tenantId,
        companyId: company.id,
        subject: `${company.name} scan review`,
        reason: "special_form",
        detail: "Detected a dynamic or non-standard contact path. Review this company before generating a sendable form target.",
        retryAllowed: true
      },
      analyticsTypes: ["scanned"]
    };
  }

  const form: FormTarget = {
    id: buildId("form"),
    tenantId: company.tenantId,
    companyId: company.id,
    url: `${company.websiteUrl}/contact`,
    fields: ["company", "name", "email", "message"],
    requiredFields: ["name", "email", "message"],
    hasConfirmationStep: true,
    sendAllowed: true,
    blockedPhraseDetected: false
  };

  const snapshot: PageSnapshot = {
    id: buildId("snapshot"),
    tenantId: company.tenantId,
    companyId: company.id,
    formTargetId: form.id,
    surroundingText: "Contact us here for questions or consultation requests.",
    confirmationText: "Please review the content before submitting.",
    textHash: buildId("hash")
  };

  return {
    company: {
      ...company,
      scanStatus: "scanned",
      formDetected: true,
      sendReady: true,
      blockReason: undefined
    },
    scan: baseScan,
    form,
    snapshot,
    analyticsTypes: ["scanned", "form_detected"]
  };
}
