'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How do credits work?',
            answer: 'Credits are used to generate websites with AI. Each website generation uses one credit. Free users get 10 monthly credits, Pro users get 100 monthly credits plus 5 daily credits. Unused credits roll over for Pro and Business users.',
        },
        {
            id: 'item-2',
            question: 'Can I use Social Forge for client work?',
            answer: 'Yes! All plans include commercial usage rights. You can build websites for clients and charge them for your services. Pro and Business plans include features specifically designed for agencies and freelancers.',
        },
        {
            id: 'item-3',
            question: 'What happens if I run out of credits?',
            answer: 'You can purchase additional credits as needed, or upgrade to a higher plan for more monthly credits. Pro users also receive 5 daily credits (up to 150/month total) to ensure you always have credits available.',
        },
        {
            id: 'item-4',
            question: 'Can I export my websites?',
            answer: 'Yes, you can export the code for your websites and host them anywhere you like. Pro and Business users can also publish directly through Social Forge with custom domains.',
        },
        {
            id: 'item-5',
            question: 'Do you offer refunds?',
            answer: 'We offer a 14-day money-back guarantee for annual plans. Monthly subscriptions can be cancelled at any time, and you will not be charged for the following month.',
        },
        {
            id: 'item-6',
            question: 'How long does it take to generate a website?',
            answer: 'Website generation typically takes 3-10 seconds. You can generate multiple design options simultaneously and choose your favorite, or iterate on a design with additional prompts.',
        },
    ]

    return (
        <div className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Discover quick and comprehensive answers to common questions about our platform, services, and features.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can&apos;t find what you&apos;re looking for? Contact our{' '}
                        <Link
                            href="/contact"
                            className="text-primary font-medium hover:underline">
                            customer support team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
