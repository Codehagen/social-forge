import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroIllustration } from "@/components/hero-illustration"

export default function HeroSection() {
    return (
        <section>
            <div className="bg-muted py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div className="max-md:text-center">
                            <span className="text-primary text-sm font-medium">Billing</span>
                            <h1 className="mt-4 text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">Streamline Your Invoicing Process</h1>
                            <p className="text-muted-foreground mb-6 mt-4 max-w-md text-balance text-lg max-md:mx-auto">Simplify invoicing with automated usage tracking and reporting tools.</p>

                            <Button asChild>
                                <Link href="#link">Get Started</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="ml-3">
                                <Link href="#link">Get a demo</Link>
                            </Button>

                            <div className="mt-12 grid max-w-sm grid-cols-2 max-md:mx-auto">
                                <div className="space-y-2 *:block">
                                    <span className="text-lg font-semibold">
                                        99.9 <span className="text-muted-foreground text-lg">%</span>
                                    </span>
                                    <p className="text-muted-foreground text-balance text-sm">
                                        <strong className="text-foreground font-medium">Uptime guarantee</strong> for all our services.
                                    </p>
                                </div>

                                <div className="space-y-2 *:block">
                                    <span className="text-lg font-semibold">
                                        12 <span className="text-muted-foreground text-lg">X</span>
                                    </span>
                                    <p className="text-muted-foreground text-balance text-sm">
                                        <strong className="text-foreground font-medium">12X</strong> faster processing than previous generation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <HeroIllustration />
                    </div>
                </div>
            </div>
        </section>
    )
}