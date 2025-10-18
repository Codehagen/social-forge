import { customAlphabet } from "nanoid";

import prisma from "@/lib/prisma";

import {
  normalizeReferralCode,
} from "./constants";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_CODE_LENGTH = 8;

const generateCode = customAlphabet(REFERRAL_ALPHABET, REFERRAL_CODE_LENGTH);

export { AFFILIATE_COOKIE_NAME, AFFILIATE_COOKIE_MAX_AGE } from "./constants";
export { normalizeReferralCode } from "./constants";

export async function generateUniqueReferralCode(): Promise<string> {
  let attempts = 0;

  while (attempts < 5) {
    attempts += 1;
    const candidate = normalizeReferralCode(generateCode());

    const existing = await prisma.affiliate.findUnique({
      where: {
        referralCode: candidate,
      },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate unique referral code");
}
