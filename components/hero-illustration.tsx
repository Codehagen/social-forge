import Image from "next/image";

export const HeroIllustration = () => {
  return (
    <div className="relative max-md:-mx-6">
      <div className="z-1 absolute inset-y-0 my-auto h-fit w-full max-w-72 origin-left scale-75 max-lg:left-6">
        <div className="bg-linear-to-r absolute -inset-6 from-purple-400 via-emerald-400 to-white opacity-40 blur-3xl"></div>

        <div className="bg-card ring-border-illustration relative rounded-2xl p-6 shadow-xl ring-1">
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Social Forge
              </span>
              <div className="text-muted-foreground mt-1 text-xs uppercase tracking-[0.24em]">
                Affiliate payout
              </div>
              <div className="mt-4 font-mono text-xs text-muted-foreground">
                Batch #SF-2024-09
              </div>
              <div className="mt-1 -translate-x-1 font-mono text-2xl font-semibold text-foreground">
                +$4,800.00
              </div>
              <div className="text-emerald-500 text-xs font-medium">
                Deposits in 3 days
              </div>
            </div>
          </div>

          <div className="border-foreground/15 bg-muted/40 mt-6 rounded-md border p-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Referrals this month</span>
              <span className="font-mono text-foreground">48</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Conversion rate</span>
              <span className="font-mono text-foreground">32%</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Pending commission</span>
              <span className="font-mono text-foreground">$620.00</span>
            </div>
          </div>
                </div>
            </div>
            <div className="mask-radial-from-75% ml-auto w-4/5 px-4 py-8">
                <div className="before:border-foreground/5 before:bg-primary/5 aspect-2/3 md:aspect-2/3 relative mt-auto h-fit overflow-hidden rounded-xl shadow-xl before:absolute before:inset-0 before:rounded-xl before:border sm:aspect-video">
                    <Image
                        src="https://res.cloudinary.com/dohqjvu9k/image/upload/v1757920412/work4_c0ffmk.webp"
                        alt="tailark hero section work 4"
                        className="size-full object-cover"
                        width={987}
                        height={1481}
                    />
                </div>
            </div>
        </div>
    )
}
