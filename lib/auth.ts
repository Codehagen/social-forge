import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { lastLoginMethod } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { stripe as stripePlugin } from "@better-auth/stripe";
import Stripe from "stripe";
import { headers } from "next/headers";

import { resolveStripePlans } from "@/lib/billing/plans";
import { handleAffiliateStripeEvent } from "@/lib/affiliates/stripe";

const prisma = new PrismaClient();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const basePlugins = [nextCookies(), lastLoginMethod()];

if (stripeSecretKey && stripeWebhookSecret) {
  const subscriptionPlans = resolveStripePlans();
  if (!subscriptionPlans.length && process.env.NODE_ENV !== "production") {
    console.warn(
      "Stripe billing plugin loaded without plan price IDs. Subscription upgrades are disabled until price IDs are configured."
    );
  }
  try {
    const stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    basePlugins.push(
      stripePlugin({
        stripeClient,
        stripeWebhookSecret,
        createCustomerOnSignUp: true,
        subscription: subscriptionPlans.length
          ? {
              enabled: true,
              plans: subscriptionPlans,
              authorizeReference: async ({ user, referenceId }) => {
                if (!referenceId) {
                  return false;
                }

                const membership = await prisma.workspaceMember.findUnique({
                  where: {
                    userId_workspaceId: {
                      userId: user.id,
                      workspaceId: referenceId,
                    },
                  },
                  select: {
                    role: true,
                  },
                });

                if (!membership) {
                  return false;
                }

                return membership.role === "OWNER" || membership.role === "ADMIN";
              },
            }
          : undefined,
        onEvent: async (event) => {
          try {
            await handleAffiliateStripeEvent(event);
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.error("Failed to handle affiliate Stripe event", error);
            }
          }
        },
      })
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to initialize Stripe plugin", error);
    }
  }
} else if (process.env.NODE_ENV !== "production") {
  console.warn(
    "Stripe billing disabled – missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET."
  );
}
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {}),
    ...(githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            scope: ['read:user', 'user:email', 'repo'],
          },
        }
      : {}),
  },
  plugins: basePlugins,
});

export async function getCurrentUser() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session?.user || null;
}
