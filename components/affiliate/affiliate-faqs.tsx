import type { ReactNode } from "react";

import {
  BarChart3,
  Ban,
  Clock,
  CreditCard,
  Gift,
  Link2,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = {
  icon: ReactNode;
  question: string;
  answer: string;
};

type FaqGroup = {
  group: string;
  items: FaqItem[];
};

const faqItems: FaqGroup[] = [
  {
    group: "Program basics",
    items: [
      {
        icon: <Users />,
        question: "What is the Social Forge Affiliate Program?",
        answer:
          "A revenue-share program where approved partners earn on every new paid workspace they refer. Share your link, track performance, and manage payouts inside the affiliate dashboard.",
      },
      {
        icon: <Gift />,
        question: "Who can join?",
        answer:
          "Creators, agencies, and communities with audiences who care about social media workflows. Apply in minutes—our team reviews requests within two business days.",
      },
      {
        icon: <Target />,
        question: "How do referrals work?",
        answer:
          "When someone signs up through your unique link, we attribute the referral for 30 days. If they become a paying workspace during that window, you earn commission.",
      },
    ],
  },
  {
    group: "Tracking & attribution",
    items: [
      {
        icon: <Link2 />,
        question: "Where do I find my referral link?",
        answer:
          "Once approved, copy your link—or generate campaign-specific links—from the affiliate dashboard. You can share it anywhere links are supported.",
      },
      {
        icon: <Clock />,
        question: "What counts as a successful conversion?",
        answer:
          "A referral is considered converted when a workspace upgrades to a paid plan within 30 days of clicking your link. Trials and free tiers don’t trigger payouts until they convert.",
      },
      {
        icon: <BarChart3 />,
        question: "How do I monitor performance?",
        answer:
          "Real-time metrics are available in the dashboard, including clicks, referrals, conversions, and pending commissions. Export data anytime for deeper analysis.",
      },
    ],
  },
  {
    group: "Payouts & policies",
    items: [
      {
        icon: <CreditCard />,
        question: "When will I get paid?",
        answer:
          "Approved commissions are paid via Stripe Connect once per month. Expect payouts within 30 days of a customer’s successful subscription charge.",
      },
      {
        icon: <ShieldCheck />,
        question: "Are there any compliance rules?",
        answer:
          "Yes—follow all applicable advertising guidelines, disclose affiliate relationships, and avoid bidding on Social Forge trademarks in paid search.",
      },
      {
        icon: <Ban />,
        question: "Can I refer myself or my own company?",
        answer:
          "Self-referrals, internal workspaces, or orders placed by family members do not qualify for commission. The program is designed for net-new customers only.",
      },
    ],
  },
];

export function AffiliateFaqs({ className }: { className?: string }) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <h2 className="text-4xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Everything you need to know about joining, promoting, and earning
            with Social Forge.
          </p>
        </div>

        <div className="mt-8 md:mt-20">
          <div className="space-y-12">
            {faqItems.map((group) => (
              <div
                key={group.group}
                id={group.group.toLowerCase().replace(/\s+/g, "-")}
                data-faq-group={group.group.toLowerCase()}
                className="space-y-6"
              >
                <h3 className="border-b pb-6 text-lg font-semibold text-foreground">
                  {group.group}
                </h3>
                <dl className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="ring-border-illustration bg-card flex size-8 rounded-md shadow ring-1 *:m-auto *:size-4">
                        {item.icon}
                      </div>
                      <dt className="font-semibold text-foreground">
                        {item.question}
                      </dt>
                      <dd className="text-muted-foreground">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
