import React from 'react'
import { ProductIllustration } from "@/components/product-illustration"
import LogoCloud from "@/components/logo-cloud"

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
                <LogoCloud />
            </section>
        </main>
    )
}
