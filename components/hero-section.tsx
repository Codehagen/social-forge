import React from 'react'
import HeroHeader from "@/components/header"
import { ProductIllustration } from "@/components/product-illustration"

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main
                role="main"
                className="bg-muted overflow-hidden">
                <section className="relative py-32 md:py-44 lg:py-52">
                    <div className="relative z-30 mx-auto max-w-5xl px-6 text-center">
                        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold sm:text-5xl">Write. Refine. Publish.</h1>

                        <p className="text-muted-foreground mx-auto mb-7 mt-3 max-w-xl text-balance text-xl">Write poetry and stories with the world's first AI poetry muse.</p>

                        <ProductIllustration />
                    </div>
                </section>
            </main>
        </>
    )
}