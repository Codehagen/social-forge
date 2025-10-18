"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  AFFILIATE_COOKIE_NAME,
  generateUniqueReferralCode,
} from "@/lib/affiliates";
import { getStripeClient } from "@/lib/stripe/server";
import { cookies } from "next/headers";
import type Stripe from "stripe";

const AFFILIATE_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function assertStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe integration is not configured.");
  }
}

export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getAffiliateProfile() {
  const session = await getCurrentSession();

  const affiliate = await prisma.affiliate.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  return affiliate;
}

export async function requestAffiliateEnrollment(note?: string) {
  const session = await getCurrentSession();
  const existingAffiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (existingAffiliate) {
    return existingAffiliate;
  }

  const referralCode = await generateUniqueReferralCode();

  const affiliate = await prisma.affiliate.create({
    data: {
      userId: session.user.id,
      referralCode,
      applicationNote: note ?? null,
      status: "PENDING",
    },
  });

  return affiliate;
}

async function ensureAffiliateForOnboarding() {
  const session = await getCurrentSession();

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  if (!affiliate) {
    throw new Error("Affiliate profile not found.");
  }

  if (affiliate.status !== "APPROVED") {
    throw new Error("Affiliate application is not approved.");
  }

  return { affiliate, session };
}

export async function createAffiliateOnboardingLink() {
  assertStripeConfigured();

  const { affiliate, session } = await ensureAffiliateForOnboarding();
  const stripe = getStripeClient();

  let stripeAccountId = affiliate.stripeConnectId;
  let account: Stripe.Account | null = null;

  if (!stripeAccountId) {
    account = await stripe.accounts.create({
      type: "express",
      email: session.user.email ?? undefined,
      capabilities: {
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;

    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        stripeConnectId: stripeAccountId,
        stripeConnectStatus: account.requirements?.disabled_reason ?? "pending",
      },
    });
  } else {
    account = await stripe.accounts.retrieve(stripeAccountId);
  }

  const onboardingLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    type: "account_onboarding",
    refresh_url: `${AFFILIATE_BASE_URL}/affiliate/onboarding?status=refresh`,
    return_url: `${AFFILIATE_BASE_URL}/affiliate/dashboard?onboarding=complete`,
  });

  if (account) {
    const status = account.details_submitted
      ? "complete"
      : account.requirements?.disabled_reason || "pending";
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        stripeConnectStatus: status,
      },
    });
  }

  return {
    url: onboardingLink.url,
    expiresAt: onboardingLink.expires_at,
  };
}

export async function refreshAffiliateAccountStatus() {
  assertStripeConfigured();

  const { affiliate } = await ensureAffiliateForOnboarding();
  if (!affiliate.stripeConnectId) {
    return affiliate;
  }

  const stripe = getStripeClient();
  const account = await stripe.accounts.retrieve(affiliate.stripeConnectId);

  const stripeStatus = account.details_submitted
    ? "complete"
    : account.requirements?.disabled_reason || "pending";

  const updated = await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: {
      stripeConnectStatus: stripeStatus,
    },
  });

  return updated;
}

export async function getAffiliateDashboardData() {
  const { affiliate } = await ensureAffiliateForOnboarding();

  const [totalReferrals, convertedReferrals, paidReferrals, pendingPayout] =
    await Promise.all([
      prisma.referral.count({
        where: { affiliateId: affiliate.id },
      }),
      prisma.referral.count({
        where: { affiliateId: affiliate.id, status: "CONVERTED" },
      }),
      prisma.referral.count({
        where: { affiliateId: affiliate.id, status: "PAID" },
      }),
      prisma.referral.aggregate({
        where: {
          affiliateId: affiliate.id,
          status: { in: ["CONVERTED", "LOCKED_IN"] },
        },
        _sum: {
          commissionAmount: true,
        },
      }),
    ]);

  return {
    affiliate,
    totals: {
      totalReferrals,
      convertedReferrals,
      paidReferrals,
      pendingCommissionCents:
        pendingPayout._sum.commissionAmount ?? 0,
    },
  };
}

type AffiliateOnboardingInput = {
  primaryChannel: string;
  promotionPlan: string;
  audienceSize?: string;
  resourcesNeeded?: string;
  stripeStatus?: string | null;
};

export async function completeAffiliateOnboarding(
  input: AffiliateOnboardingInput
) {
  const { affiliate } = await ensureAffiliateForOnboarding();

  if (!input.primaryChannel?.trim() || !input.promotionPlan?.trim()) {
    throw new Error("Promotion details are required to finish onboarding.");
  }

  const existingData = (affiliate.onboardingData ?? {}) as
    | Record<string, unknown>
    | undefined;

  const updated = await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: {
      onboardingCompleted: true,
      onboardingData: {
        ...(existingData ?? {}),
        ...input,
        completedAt: new Date().toISOString(),
      },
    },
  });

  return updated;
}

export async function setReferralForCurrentUser() {
  const session = await getCurrentSession();
  const cookieStore = await cookies();
  const referralCookie = cookieStore.get(AFFILIATE_COOKIE_NAME);

  if (!referralCookie?.value) {
    return null;
  }

  const referralCode = referralCookie.value;

  const referral = await prisma.referral.findFirst({
    where: {
      OR: [
        { userId: session.user.id },
        { referralCode, userId: null },
      ],
    },
  });

  if (referral) {
    if (!referral.userId) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          userId: session.user.id,
          lockedInAt: new Date(),
          status: "LOCKED_IN",
        },
      });
    }
    return referral;
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode },
  });

  if (!affiliate) {
    return null;
  }

  return prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      referralCode,
      userId: session.user.id,
      lockedInAt: new Date(),
      status: "LOCKED_IN",
    },
  });
}

export async function adminListAffiliates() {
  const session = await getCurrentSession();

  const operator = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      agent: true,
      superAdmin: true,
    },
  });

  if (!operator || (!operator.agent && !operator.superAdmin)) {
    throw new Error("Forbidden");
  }

  return prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function adminUpdateAffiliateStatus(
  affiliateId: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
) {
  const session = await getCurrentSession();
  const operator = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      agent: true,
      superAdmin: true,
    },
  });

  if (!operator || (!operator.agent && !operator.superAdmin)) {
    throw new Error("Forbidden");
  }

  const data: Record<string, unknown> = {
    status,
  };

  if (status === "APPROVED") {
    data.approvedAt = new Date();
  }

  return prisma.affiliate.update({
    where: { id: affiliateId },
    data,
  });
}
