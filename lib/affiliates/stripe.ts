import type Stripe from "stripe";

import prisma from "@/lib/prisma";

function resolveStripeConnectStatus(account: Stripe.Account): string {
  if (account.details_submitted) {
    return "complete";
  }

  return account.requirements?.disabled_reason || "pending";
}

export async function handleAffiliateStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "account.updated":
    case "account.external_account.updated": {
      const account = event.data.object as Stripe.Account;
      if (!account.id) return;

      await prisma.affiliate.updateMany({
        where: {
          stripeConnectId: account.id,
        },
        data: {
          stripeConnectStatus: resolveStripeConnectStatus(account),
        },
      });
      break;
    }
    default:
      break;
  }
}
