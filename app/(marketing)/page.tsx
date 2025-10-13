import React from 'react'
import { ProductIllustration } from "@/components/product-illustration"
import LogoCloud from "@/components/logo-cloud"
import { Card } from '@/components/ui/card'
import { Table } from "@/components/table"
import { UptimeIllustration } from "@/components/uptime-illustration"
import { MemoryUsageIllustration } from "@/components/memory-usage-illustration"
import { Zap, Layers, Heart } from 'lucide-react'

export default function Home() {
    return (
        <main
            role="main"
            className="bg-muted overflow-hidden">
            <section className="relative py-32 md:py-44 lg:py-52">
                <div className="relative z-30 mx-auto max-w-5xl px-6 text-center">
                    <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold sm:text-5xl">Build your social presence with AI</h1>

                    <p className="text-muted-foreground mx-auto mb-7 mt-3 max-w-xl text-balance text-xl">Create and manage social content by chatting with AI</p>

                    <ProductIllustration />
                </div>
            </section>
            <section className="border-foreground/10 relative mt-8 border-t sm:mt-16">
                <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
                    <div className="border-x">
                        <LogoCloud />
                    </div>
                </div>
            </section>
            <section className="bg-background @container">
                <div className="[--color-primary:var(--color-indigo-300)]">
                    <div className="mx-auto max-w-6xl border-x px-3">
                        <div className="border-x">
                            <div
                                aria-hidden
                                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
                            />
                            <div className="px-6 py-24">
                            <div className="mx-auto mb-12 max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold mb-3">Make money by making websites</h2>
                                <p className="text-muted-foreground text-lg">Turn your web development skills into a profitable business with our AI-powered platform</p>
                            </div>
                            <div className="@2xl:grid-cols-2 @2xl:grid-rows-2 @4xl:grid-cols-3 grid gap-6">
                            <Card className="@xl:col-span-2 @2xl:row-span-2 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                                <div>
                                    <Zap className="text-muted-foreground size-4" />
                                    <h3 className="text-foreground mb-2 mt-4 font-semibold">Scale and Sell Websites Fast</h3>
                                    <p className="text-muted-foreground">Build and deploy professional websites in minutes. Scale your web agency and sell to businesses quickly with AI-powered automation.</p>
                                </div>
                                <div
                                    aria-hidden
                                    className="perspective-dramatic mask-b-from-55% mask-r-from-55% -mx-8 h-fit px-8">
                                    <div className="relative -mr-8">
                                        <Table />
                                    </div>
                                </div>
                            </Card>
                            <Card className="grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                                <div>
                                    <Layers className="text-muted-foreground size-4" />
                                    <h3 className="text-foreground mb-2 mt-4 font-semibold">Template Library</h3>
                                    <p className="text-muted-foreground">Access a growing collection of pre-built templates for every industry and use case.</p>
                                </div>
                                <MemoryUsageIllustration />
                            </Card>
                            <Card className="grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                                <div>
                                    <Heart className="text-muted-foreground size-4" />
                                    <h3 className="text-foreground mb-2 mt-4 font-semibold">Customer Satisfaction</h3>
                                    <p className="text-muted-foreground">Track how your clients feel about their websites with built-in feedback and analytics.</p>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <UptimeIllustration />
                                </div>
                            </Card>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
