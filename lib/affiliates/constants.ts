export const AFFILIATE_COOKIE_NAME = "sf_ref";
export const AFFILIATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}
