import type { Company, FormTarget, PageSnapshot, ReviewQueueItem, WebsiteScan } from "@/lib/types";

function slugFromUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

export interface ScanResult {
  company: Company;
  scan: WebsiteScan;
  form?: FormTarget;
  snapshot?: PageSnapshot;
  review?: ReviewQueueItem;
  analyticsTypes: Array<"scanned" | "form_detected">;
}

export function simulateScan(company: Company): ScanResult {
  const domain = slugFromUrl(company.websiteUrl);
  const scannedAt = new Date().toISOString();
  const baseScan: WebsiteScan = {
    id: `scan_${Date.now()}`,
    tenantId: company.tenantId,
    companyId: company.id,
    discoveredPages: ["/", "/about", "/contact", "/privacy"],
    contactCandidateUrls: [`${company.websiteUrl}/contact`],
    lastScannedAt: scannedAt
  };

  if (company.name.includes("Takumi") || company.industry === "製造") {
    const review: ReviewQueueItem = {
      id: `review_${Date.now()}`,
      tenantId: company.tenantId,
      companyId: company.id,
      subject: `${company.name} の問い合わせフォーム`,
      reason: "ambiguous_phrase",
      detail: "フォーム周辺文言に営業目的の送信禁止表現を検知したため、レビューに回しました。",
      retryAllowed: false
    };

    const form: FormTarget = {
      id: `form_${Date.now()}`,
      tenantId: company.tenantId,
      companyId: company.id,
      url: `${company.websiteUrl}/contact`,
      fields: ["company", "name", "email", "message"],
      requiredFields: ["name", "email", "message"],
      hasConfirmationStep: false,
      sendAllowed: false,
      blockedPhraseDetected: true,
      failureReason: "営業禁止文言を検知"
    };

    const snapshot: PageSnapshot = {
      id: `snapshot_${Date.now()}`,
      tenantId: company.tenantId,
      companyId: company.id,
      formTargetId: form.id,
      surroundingText: "営業目的のご連絡はお断りします。製品に関するお問い合わせのみ受け付けます。",
      confirmationText: "内容確認後に送信します。",
      textHash: `hash_${Date.now()}`
    };

    return {
      company: {
        ...company,
        scanStatus: "needs_review",
        formDetected: true,
        sendReady: false,
        blockReason: "営業禁止文言を検知"
      },
      scan: baseScan,
      form,
      snapshot,
      review,
      analyticsTypes: ["scanned", "form_detected"]
    };
  }

  if (company.name.includes("Northfield")) {
    return {
      company: {
        ...company,
        scanStatus: "needs_review",
        formDetected: false,
        sendReady: false,
        blockReason: "問い合わせ導線が SPA 内にあり追加解析が必要"
      },
      scan: {
        ...baseScan,
        discoveredPages: ["/", "/company"],
        contactCandidateUrls: [],
        failureReason: "contact / inquiry 導線が見つからずレビューへ移動"
      },
      review: {
        id: `review_${Date.now()}`,
        tenantId: company.tenantId,
        companyId: company.id,
        subject: `${company.name} のフォーム探索`,
        reason: "special_form",
        detail: "問い合わせ導線が動的描画で隠れているため、追加解析が必要です。",
        retryAllowed: true
      },
      analyticsTypes: ["scanned"]
    };
  }

  const form: FormTarget = {
    id: `form_${Date.now()}`,
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
    id: `snapshot_${Date.now()}`,
    tenantId: company.tenantId,
    companyId: company.id,
    formTargetId: form.id,
    surroundingText: "ご相談やご質問はこちらのフォームからお問い合わせください。",
    confirmationText: "内容をご確認のうえ送信してください。",
    textHash: `hash_${Date.now()}`
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
