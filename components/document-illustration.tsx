import { cn } from '@/lib/utils'
import { Signature } from 'lucide-react'

export const DocumentIllustation = ({ className }: { className?: string }) => {
    return (
        <div
            aria-hidden
            className={cn('bg-background relative z-10 w-16 space-y-2 rounded-md p-2 shadow-md shadow-black/15', className)}>
            <div className="flex items-center gap-1">
                <div className="bg-foreground/15 size-2.5 rounded-full" />
                <div className="bg-foreground/15 h-[3px] w-4 rounded-full" />
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                    <div className="bg-foreground/15 h-[3px] w-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-[3px] w-6 rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="bg-foreground/15 h-[3px] w-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-[3px] w-6 rounded-full" />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="bg-foreground/15 h-[3px] w-full rounded-full" />
                <div className="flex items-center gap-1">
                    <div className="bg-foreground/15 h-[3px] w-2/3 rounded-full" />
                    <div className="bg-foreground/15 h-[3px] w-1/3 rounded-full" />
                </div>
            </div>

            <Signature className="ml-auto size-3" />
        </div>
    )
}