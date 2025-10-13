export const UptimeIllustration = () => (
    <div
        aria-hidden
        className="border-border-illustration bg-illustration space-y-2.5 rounded-2xl border p-4">
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Client Satisfaction</span>
            <span className="text-foreground">98.5%</span>
        </div>
        <div className="mask-x-from-55% flex justify-between gap-px">
            {Array.from({ length: 40 }).map((_, index) => (
                <div
                    key={index}
                    className="[:nth-child(10)]:bg-muted-foreground [:nth-child(11)]:bg-muted-foreground [:nth-child(22)]:bg-muted-foreground [:nth-child(23)]:bg-muted-foreground [:nth-child(24)]:bg-muted-foreground [:nth-child(32)]:bg-muted-foreground h-7 w-0.5 bg-emerald-500"></div>
            ))}
        </div>
    </div>
)