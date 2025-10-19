"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

const BASE_COMMISSION_USD = 100;
const BONUS_RATE = 0.2;
const DEFAULT_REFERRALS = 10;
const DEFAULT_AVERAGE_PLAN = 300;
const MAX_REFERRALS = 200;
const MAX_AVERAGE_PLAN = 1000;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", listener);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return prefersReducedMotion;
}

export function AffiliateEarningsCalculator({
  className,
}: {
  className?: string;
}) {
  const referralsId = useId();
  const averagePlanId = useId();

  const [referrals, setReferrals] = useState<number>(DEFAULT_REFERRALS);
  const [averagePlan, setAveragePlan] = useState<number>(DEFAULT_AVERAGE_PLAN);
  const prefersReducedMotion = usePrefersReducedMotion();

  const monthlyEstimate = useMemo(() => {
    const base = referrals * BASE_COMMISSION_USD;
    const bonus = referrals * averagePlan * BONUS_RATE;
    return base + bonus;
  }, [referrals, averagePlan]);

  const annualEstimate = useMemo(
    () => monthlyEstimate * 12,
    [monthlyEstimate]
  );

  return (
    <section className={cn("mx-auto max-w-6xl px-6", className)}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div className="space-y-3 text-center lg:text-left">
            <span className="text-sm font-medium uppercase text-muted-foreground">
              Earnings calculator
            </span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Model your affiliate payouts
            </h2>
            <p className="mx-auto max-w-2xl text-balance text-muted-foreground lg:mx-0">
              Dial in how many workspaces you expect to refer and see what your
              monthly and annual payouts could look like. Numbers update as you
              tweak the sliders.
            </p>
          </div>

          <div className="rounded-3xl border bg-card/60 p-6 shadow-sm backdrop-blur-sm md:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={referralsId} className="text-base">
                    Monthly referred workspaces
                  </Label>
                  <Input
                    id={referralsId}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX_REFERRALS}
                    value={referrals}
                    onChange={(event) => {
                      const raw = Number.parseInt(
                        event.target.value || "0",
                        10
                      );
                      const next = clamp(
                        Number.isNaN(raw) ? 0 : raw,
                        0,
                        MAX_REFERRALS
                      );
                      setReferrals(next);
                    }}
                    className="h-10 w-24 text-right"
                    aria-describedby={`${referralsId}-hint`}
                  />
                </div>
                <Slider
                  min={0}
                  max={MAX_REFERRALS}
                  step={1}
                  value={[referrals]}
                  onValueChange={([next]) => {
                    if (typeof next === "number") {
                      setReferrals(clamp(Math.round(next), 0, MAX_REFERRALS));
                    }
                  }}
                  aria-labelledby={referralsId}
                />
                <p
                  id={`${referralsId}-hint`}
                  className="text-sm text-muted-foreground"
                >
                  Most partners start by referring 5–25 workspaces each month.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={averagePlanId} className="text-base">
                    Average monthly plan value
                  </Label>
                  <Input
                    id={averagePlanId}
                    type="number"
                    inputMode="decimal"
                    min={50}
                    max={MAX_AVERAGE_PLAN}
                    step={10}
                    value={averagePlan}
                    onChange={(event) => {
                      const raw = Number.parseFloat(
                        event.target.value || "0"
                      );
                      const next = clamp(
                        Number.isNaN(raw) ? 50 : raw,
                        50,
                        MAX_AVERAGE_PLAN
                      );
                      setAveragePlan(next);
                    }}
                    className="h-10 w-28 text-right"
                    aria-describedby={`${averagePlanId}-hint`}
                  />
                </div>
                <p
                  id={`${averagePlanId}-hint`}
                  className="text-sm text-muted-foreground"
                >
                  Based on the plan your referrals choose. Adjust to match your
                  audience.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            <Button asChild size="lg">
              <Link href="/affiliate/apply">Apply today</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/affiliate/apply#terms">View program terms</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Your projected payout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1" aria-live="polite">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">
                  Monthly estimate
                </p>
                <div className="flex flex-col">
                  {prefersReducedMotion ? (
                    <p className="text-4xl font-semibold tracking-tight">
                      {currencyFormatter.format(Math.round(monthlyEstimate))}
                    </p>
                  ) : (
                    <>
                      <NumberFlow
                        value={Math.round(monthlyEstimate)}
                        format={{
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }}
                        className="text-4xl font-semibold tracking-tight"
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        {currencyFormatter.format(Math.round(monthlyEstimate))}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-muted-foreground/10 bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Annual potential</span>
                  <span className="font-medium text-foreground">
                    {prefersReducedMotion ? (
                      currencyFormatter.format(Math.round(annualEstimate))
                    ) : (
                      <>
                        <NumberFlow
                          value={Math.round(annualEstimate)}
                          format={{
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }}
                          className="inline-block"
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {currencyFormatter.format(Math.round(annualEstimate))}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Includes ${BASE_COMMISSION_USD} commission per paid workspace
                plus a {Math.round(BONUS_RATE * 100)}% revenue share on their
                first-year subscription.
              </li>
              <li>
                Payouts land via Stripe Connect within 30 days of a successful
                conversion.
              </li>
              <li>
                Track referrals and see real-time progress inside your affiliate
                dashboard.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
