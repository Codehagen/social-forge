'use client'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'
import NumberFlow from '@number-flow/react'

export default function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually')
    const annualReduction = 0.75

    const prices = {
        pro: {
            monthly: 25,
            annually: 25 * annualReduction,
        },
        business: {
            monthly: 50,
            annually: 50 * annualReduction,
        },
    }

    return (
        <div className="relative py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl lg:tracking-tight">Start for free</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-balance text-lg">Upgrade to get the capacity that exactly matches your team's needs</p>

                    <div className="my-12">
                            <div
                                data-period={billingPeriod}
                                className="bg-foreground/5 *:text-foreground/75 relative mx-auto grid w-fit grid-cols-2 rounded-full p-1 *:block *:h-8 *:w-24 *:rounded-full *:text-sm *:hover:opacity-75">
                                <div
                                    aria-hidden
                                    className="bg-card in-data-[period=monthly]:translate-x-0 ring-foreground/5 pointer-events-none absolute inset-1 w-1/2 translate-x-full rounded-full border border-transparent shadow ring-1 transition-transform duration-500 ease-in-out"
                                />
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    {...(billingPeriod === 'monthly' && { 'data-active': true })}
                                    className="data-active:text-foreground data-active:font-medium relative">
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('annually')}
                                    {...(billingPeriod === 'annually' && { 'data-active': true })}
                                    className="data-active:text-foreground data-active:font-medium relative">
                                    Annually
                                </button>
                            </div>
                            <div className="mt-3 text-center text-xs">
                                <span className="text-primary font-medium">Save 25%</span> On Annual Billing
                            </div>
                    </div>
                </div>
                <div className="@container">
                    <div className="@4xl:max-w-full mx-auto max-w-sm rounded-xl border">
                        <div className="@4xl:grid-cols-4 grid *:p-8">
                            <div className="@max-4xl:p-9 row-span-4 grid grid-rows-subgrid gap-8">
                                    <div className="self-end">
                                        <CardTitle className="text-lg font-medium">Free</CardTitle>
                                        <div className="text-muted-foreground mt-1 text-balance text-sm">For individuals trying out Social Forge</div>
                                    </div>

                                    <div>
                                        <NumberFlow
                                            value={0}
                                            prefix="$"
                                            className="text-3xl font-semibold"
                                        />
                                        <div className="text-muted-foreground text-sm">Per month</div>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full">
                                        <Link href="/sign-up">Get Started</Link>
                                    </Button>

                                    <ul
                                        role="list"
                                        className="space-y-3 text-sm">
                                        {['10 monthly credits', 'Basic templates', 'Community support'].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2">
                                                <Check
                                                    className="text-muted-foreground size-3"
                                                    strokeWidth={3.5}
                                                />
                                                {item}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                            <div className="ring-foreground/10 bg-card rounded-(--radius) @4xl:my-2 @max-4xl:mx-1 row-span-4 grid grid-rows-subgrid gap-8 border-transparent shadow shadow-xl ring-1 backdrop-blur">
                                <div className="self-end">
                                    <CardTitle className="text-lg font-medium">Pro</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1 text-balance text-sm">Designed for fast-moving teams building websites together in real time</CardDescription>
                                </div>

                                <div>
                                    <NumberFlow
                                        value={prices.pro[billingPeriod]}
                                        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                                        className="text-3xl font-semibold"
                                    />
                                    <div className="text-muted-foreground text-sm">per month</div>
                                    <div className="text-muted-foreground text-xs mt-1">shared across unlimited users</div>
                                </div>
                                <Button
                                    asChild
                                    className="w-full">
                                    <Link href="/sign-up">Upgrade</Link>
                                </Button>

                                <ul
                                    role="list"
                                    className="space-y-3 text-sm">
                                    {['Everything in Free, plus:', '100 monthly credits', '5 daily credits (up to 150/month)', 'Usage-based Cloud + AI', 'Credit rollovers', 'Custom domains', 'Remove Social Forge badge', 'Private projects', 'User roles & permissions'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="group flex items-center gap-2 first:font-medium">
                                            <Check
                                                className="text-muted-foreground size-3 group-first:hidden"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="@max-4xl:p-9 row-span-4 grid grid-rows-subgrid gap-8">
                                <div className="self-end">
                                    <CardTitle className="text-lg font-medium">Business</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1 text-balance text-sm">Advanced controls and power features for growing departments</CardDescription>
                                </div>

                                <div>
                                    <NumberFlow
                                        value={prices.business[billingPeriod]}
                                        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                                        className="text-3xl font-semibold"
                                    />
                                    <div className="text-muted-foreground text-sm">per month</div>
                                    <div className="text-muted-foreground text-xs mt-1">shared across unlimited users</div>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full">
                                    <Link href="/sign-up">Upgrade</Link>
                                </Button>

                                <ul
                                    role="list"
                                    className="space-y-3 text-sm">
                                    {['All features in Pro, plus:', 'SSO', 'Personal Projects', 'Opt out of data training', 'Design templates', 'Priority support'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="group flex items-center gap-2 first:font-medium">
                                            <Check
                                                className="text-muted-foreground size-3 group-first:hidden"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="@max-4xl:p-9 row-span-4 grid grid-rows-subgrid gap-8">
                                <div className="self-end">
                                    <CardTitle className="text-lg font-medium">Enterprise</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1 text-balance text-sm">Built for large orgs needing flexibility, scale, and governance</CardDescription>
                                </div>

                                <div>
                                    <div className="text-2xl font-semibold">Flexible billing</div>
                                    <div className="text-muted-foreground text-sm">Custom plans</div>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full">
                                    <Link href="/contact">Book a demo</Link>
                                </Button>

                                <ul
                                    role="list"
                                    className="space-y-3 text-sm">
                                    {['Everything in Business, plus:', 'Dedicated support', 'Onboarding services', 'Custom connections', 'Group-based access control', 'Custom design systems'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="group flex items-center gap-2 first:font-medium">
                                            <Check
                                                className="text-muted-foreground size-3 group-first:hidden"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}