// Note: This file is imported by both server and client modules.
// Keep runtime dependencies lightweight (no server-only imports).

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export const SITE_STATUS_VALUES = [
  "DRAFT",
  "REVIEW",
  "READY_FOR_TRANSFER",
  "LIVE",
  "ARCHIVED",
] as const;

export type SiteStatusValue = (typeof SITE_STATUS_VALUES)[number];

const STATUS_SEPARATOR = ",";

export function isSiteStatusValue(value: string): value is SiteStatusValue {
  return SITE_STATUS_VALUES.includes(value as SiteStatusValue);
}

export function parsePageParam(
  raw: string | string[] | undefined,
  fallback: number
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseLimitParam(
  raw: string | string[] | undefined,
  fallback: number
): number {
  const parsed = parsePageParam(raw, fallback);
  // Guard the limit to keep within sensible bounds.
  return Math.min(Math.max(parsed, 1), 100);
}

export function parseSearchParam(
  raw: string | string[] | undefined
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ?? "";
}

export function parseStatusesParam(
  raw: string | string[] | undefined
): SiteStatusValue[] {
  if (!raw) {
    return [];
  }

  const values = (Array.isArray(raw) ? raw : raw.split(STATUS_SEPARATOR))
    .flatMap((item) => item.split(STATUS_SEPARATOR))
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = new Set<string>();

  for (const value of values) {
    if (isSiteStatusValue(value)) {
      unique.add(value);
    }
  }

  return Array.from(unique) as SiteStatusValue[];
}

export function serializeStatusesParam(values: SiteStatusValue[]): string {
  if (!values.length) {
    return "";
  }

  const seen = new Set<string>();
  const normalized: SiteStatusValue[] = [];

  for (const value of values) {
    if (isSiteStatusValue(value) && !seen.has(value)) {
      seen.add(value);
      normalized.push(value);
    }
  }

  return normalized.join(STATUS_SEPARATOR);
}
