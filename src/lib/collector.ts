import type { CollectionSource, Company, LeadCollectionRule } from "@/lib/types";

const companySuffixBySource: Record<CollectionSource, string[]> = {
  search: ["Digital", "Consulting", "Works", "Partners"],
  directory: ["Systems", "Office", "Factory", "Solutions"]
};

function slugify(parts: string[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pick<T>(list: T[], index: number, fallback: T) {
  return list[index % list.length] ?? fallback;
}

export interface GeneratedCompanyCandidate {
  name: string;
  websiteUrl: string;
  industry: string;
  region: string;
  source: CollectionSource;
  dedupeKey: string;
}

export function buildSearchQueries(rule: LeadCollectionRule) {
  const industries = rule.industries.length ? rule.industries : ["B2B"];
  const regions = rule.regions.length ? rule.regions : ["japan"];
  const keywords = rule.keywords.length ? rule.keywords : ["contact"];

  return rule.sources.flatMap((source) =>
    regions.flatMap((region) =>
      industries.map((industry, index) =>
        [region, industry, pick(keywords, index, "contact"), source === "search" ? "website" : "directory"].join(" ")
      )
    )
  );
}

export function generateCompanyCandidates(rule: LeadCollectionRule) {
  const queries = buildSearchQueries(rule);
  const industries = rule.industries.length ? rule.industries : ["General"];
  const regions = rule.regions.length ? rule.regions : ["Japan"];

  return queries.map((query, index) => {
    const source = pick(rule.sources, index, "search");
    const industry = pick(industries, index, "General");
    const region = pick(regions, index, "Japan");
    const keyword = pick(rule.keywords, index, "contact");
    const suffix = pick(companySuffixBySource[source], index, "Partners");
    const slug = slugify([region, industry, keyword, suffix]);

    return {
      name: `${titleCase(slug)} ${suffix}`,
      websiteUrl: `https://${slug}.example.jp`,
      industry,
      region,
      source,
      dedupeKey: `${slug}.example.jp`
    } satisfies GeneratedCompanyCandidate;
  });
}

export function materializeCollectedCompanies(
  tenantId: string,
  rule: LeadCollectionRule,
  existingCompanies: Company[]
) {
  const now = new Date().toISOString();
  const existingKeys = new Set(existingCompanies.map((company) => company.dedupeKey));
  const candidates = generateCompanyCandidates(rule).filter((candidate) => !existingKeys.has(candidate.dedupeKey));

  return candidates.map((candidate, index) => ({
    id: `company_${Date.now()}_${index}`,
    tenantId,
    name: candidate.name,
    websiteUrl: candidate.websiteUrl,
    industry: candidate.industry,
    region: candidate.region,
    source: candidate.source,
    dedupeKey: candidate.dedupeKey,
    scanStatus: "queued" as const,
    formDetected: false,
    sendReady: false,
    blockReason: `問い合わせ導線を探索中 (${now})`
  }));
}
