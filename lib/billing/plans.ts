export type PlanId = "free" | "creator" | "agency" | "enterprise";

export type PlanLimits = {
  /**
   * Maximum number of active (non-archived) projects/workspaces can hold.
   * Use null for unlimited.
   */
  activeProjects: number | null;
  /**
   * Number of AI credits granted per calendar month.
   */
  aiCreditsPerMonth: number | null;
  /**
   * Daily AI credit allowance (used for Free plan throttling).
   */
  aiCreditsPerDay: number | null;
  /**
   * Included member seats in the base subscription.
   */
  includedSeats: number | null;
};

type StripePriceEnvKeys = {
  monthly?: string;
  annual?: string;
};

export type BillingPlan = {
  id: PlanId;
  label: string;
  targetUser: string;
  description: string;
  isPaid: boolean;
  order: number;
  limits: PlanLimits;
  stripePriceEnv?: StripePriceEnvKeys;
  features: string[];
};

export type StripePlanConfig = {
  name: string;
  priceId: string;
  annualDiscountPriceId?: string;
  limits?: Record<string, number>;
  freeTrial?: Stripe.CustomerCreateParams.TrialSettings | Record<string, unknown>;
};

const PLAN_DEFINITIONS: Record<PlanId, BillingPlan> = {
  free: {
    id: "free",
    label: "Free",
    targetUser: "Hobbyists / testing",
    description: "Try Social Forge with a single active project and lightweight daily credits.",
    isPaid: false,
    order: 0,
    limits: {
      activeProjects: 1,
      aiCreditsPerMonth: null,
      aiCreditsPerDay: 10,
      includedSeats: 1,
    },
    features: ["1 active project", "10 AI credits per day", "Basic templates"],
  },
  creator: {
    id: "creator",
    label: "Creator",
    targetUser: "Freelancers",
    description: "Scale to multiple client builds with custom domains and higher credit allocations.",
    isPaid: true,
    order: 1,
    limits: {
      activeProjects: 5,
      aiCreditsPerMonth: 500,
      aiCreditsPerDay: null,
      includedSeats: 3,
    },
    stripePriceEnv: {
      monthly: "STRIPE_PRICE_CREATOR_MONTHLY",
      annual: "STRIPE_PRICE_CREATOR_ANNUAL",
    },
    features: [
      "5 active projects",
      "500 AI credits per month",
      "Custom domains",
      "Team seats (3)",
    ],
  },
  agency: {
    id: "agency",
    label: "Agency",
    targetUser: "Small web agencies",
    description: "Serve multiple clients with dedicated seats, bulk credits, and a client dashboard.",
    isPaid: true,
    order: 2,
    limits: {
      activeProjects: 20,
      aiCreditsPerMonth: 5_000,
      aiCreditsPerDay: null,
      includedSeats: 3,
    },
    stripePriceEnv: {
      monthly: "STRIPE_PRICE_AGENCY_MONTHLY",
      annual: "STRIPE_PRICE_AGENCY_ANNUAL",
    },
    features: [
      "20 active projects",
      "5,000 AI credits per month",
      "Team seats (3)",
      "Client dashboard",
    ],
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    targetUser: "SaaS platforms / large teams",
    description: "Custom contracts with optional SSO, SLA, model tuning, and account management.",
    isPaid: true,
    order: 3,
    limits: {
      activeProjects: null,
      aiCreditsPerMonth: null,
      aiCreditsPerDay: null,
      includedSeats: null,
    },
    stripePriceEnv: {
      monthly: undefined,
      annual: undefined,
    },
    features: [
      "Unlimited active projects",
      "Custom AI model tuning",
      "SSO + SLA",
      "Dedicated account manager",
    ],
  },
};

const NUMERIC_LIMIT_KEYS: Array<keyof PlanLimits> = [
  "activeProjects",
  "aiCreditsPerMonth",
  "aiCreditsPerDay",
  "includedSeats",
];

export function getBillingPlans(): BillingPlan[] {
  return Object.values(PLAN_DEFINITIONS).sort((a, b) => a.order - b.order);
}

export function getBillingPlan(planId: PlanId): BillingPlan {
  return PLAN_DEFINITIONS[planId];
}

export function resolvePlanId(input: string | null | undefined): PlanId {
  if (!input) return "free";
  const key = input.toLowerCase() as PlanId;
  return key in PLAN_DEFINITIONS ? key : "free";
}

export function resolveStripePlans(): StripePlanConfig[] {
  return getBillingPlans()
    .filter((plan) => plan.isPaid && plan.stripePriceEnv?.monthly)
    .map((plan) => {
      const priceId = plan.stripePriceEnv?.monthly
        ? process.env[plan.stripePriceEnv.monthly]
        : undefined;

      if (!priceId) {
        return null;
      }

      const annualPriceId =
        plan.stripePriceEnv?.annual &&
        process.env[plan.stripePriceEnv.annual]?.length
          ? process.env[plan.stripePriceEnv.annual]
          : undefined;

      const numericLimits = Object.fromEntries(
        NUMERIC_LIMIT_KEYS.filter(
          (limitKey) =>
            plan.limits[limitKey] !== null &&
            typeof plan.limits[limitKey] === "number"
        ).map((limitKey) => [limitKey, plan.limits[limitKey] as number])
      );

      return {
        name: plan.id,
        priceId,
        annualDiscountPriceId: annualPriceId,
        limits: Object.keys(numericLimits).length ? numericLimits : undefined,
      };
    })
    .filter((plan): plan is StripePlanConfig => Boolean(plan));
}

export function isStripeBillingConfigured(): boolean {
  const plans = resolveStripePlans();
  const requiredKeys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] as const;
  const hasCoreSecrets = requiredKeys.every(
    (key) => process.env[key] && process.env[key] !== ""
  );
  return hasCoreSecrets && plans.length > 0;
}
