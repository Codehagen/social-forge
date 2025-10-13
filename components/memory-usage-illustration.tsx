export const MemoryUsageIllustration = () => (
    <div
        aria-hidden
        className="mask-r-from-55% mask-l-from-85% -mx-8 -mb-8 flex flex-col justify-end border-t px-8 pb-8 pt-4">
        <div className="space-y-2.5">
            <span className="text-foreground block text-sm font-medium">Memory Usage</span>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground text-sm">56 GB / 128 GB</span>
                <span className="text-foreground">45%</span>
            </div>
            <div className="before:bg-linear-to-r before:z-1 bg-muted after:bg-linear-to-r after:blur-xs relative my-1.5 h-1.5 rounded-full before:absolute before:inset-0 before:w-2/5 before:rounded-full before:from-white before:to-indigo-400 after:absolute after:inset-0 after:w-2/5 after:from-white after:to-indigo-400 after:opacity-50" />
        </div>
    </div>
)