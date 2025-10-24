import { Card } from '@/components/ui/card'
import { Table } from "@/components/table"
import { UptimeIllustration } from "@/components/uptime-illustration"
import { MemoryUsageIllustration } from "@/components/memory-usage-illustration"
import { Activity, BetweenHorizonalEnd, MemoryStick } from 'lucide-react'

export default function BentoSeven() {
    return (
        <section
            data-theme="dark"
            className="bg-background @container">
            <div className="py-24 [--color-primary:var(--color-indigo-300)]">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div className="@2xl:grid-cols-2 @2xl:grid-rows-2 @4xl:grid-cols-3 grid gap-6">
                        <Card className="@xl:col-span-2 @2xl:row-span-2 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                            <div>
                                <BetweenHorizonalEnd className="text-muted-foreground size-4" />
                                <h3 className="text-foreground mb-2 mt-4 font-semibold">Advanced Data Visualization</h3>
                                <p className="text-muted-foreground">Transform complex data into clear, actionable insights with our powerful visualization tools.</p>
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
                                <MemoryStick className="text-muted-foreground size-4" />
                                <h3 className="text-foreground mb-2 mt-4 font-semibold">Memory Optimization</h3>
                                <p className="text-muted-foreground">Monitor and optimize your system&apos;s memory usage.</p>
                            </div>
                            <MemoryUsageIllustration />
                        </Card>
                        <Card className="grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                            <div>
                                <Activity className="text-muted-foreground size-4" />
                                <h3 className="text-foreground mb-2 mt-4 font-semibold">Uptime Monitoring</h3>
                                <p className="text-muted-foreground">Track your service reliability with real-time uptime metrics.</p>
                            </div>
                            <div className="flex flex-col justify-end">
                                <UptimeIllustration />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}