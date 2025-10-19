import { Activity, Clock, DollarSign, Globe, Lock, Scale, ShoppingBag, Undo2, WalletCards } from 'lucide-react'

export default function FAQs() {
    const faqItems = [
        {
            group: 'General',
            items: [
                {
                    icon: <Clock />,
                    question: 'How long does shipping take?',
                    answer: 'Standard shipping takes 3-5 business days, depending on your location. Express shipping options are available.',
                },
                {
                    icon: <WalletCards />,
                    question: 'What Methods do you accept?',
                    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay.',
                },
                {
                    icon: <ShoppingBag />,
                    question: 'Can I change or cancel my order?',
                    answer: 'You can modify or cancel your order within 1 hour of placing it. After this window.',
                },
            ],
        },
        {
            group: 'Shipping',
            items: [
                {
                    icon: <Globe />,
                    question: 'Do you ship internationally?',
                    answer: 'Yes, we ship to many countries worldwide. Shipping costs and times vary based on the destination.',
                },
                {
                    icon: <Scale />,
                    question: 'What is your return policy?',
                    answer: 'We offer a 30-day return policy for most items. Products must be in original condition with tags attached.',
                },
                {
                    icon: <Activity />,
                    question: 'What are your shipping rates?',
                    answer: 'Shipping rates vary based on the selected shipping speed and the destination of your order.',
                },
            ],
        },
        {
            group: 'Payment',
            items: [
                {
                    icon: <DollarSign />,
                    question: 'What currencies do you accept?',
                    answer: 'We accept payments in various currencies. The available currencies will be displayed.',
                },
                {
                    icon: <Lock />,
                    question: 'Is my payment information secure?',
                    answer: 'Yes, we use industry-standard encryption to protect your payment information during.',
                },
                {
                    icon: <Undo2 />,
                    question: 'Can I get a refund?',
                    answer: 'Yes, you can request a refund within 14 days of receiving your order. The item must be in its original condition.',
                },
            ],
        },
    ]

    return (
        <section className="bg-muted py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-lg">
                    <h2 className="text-foreground text-4xl font-semibold">FAQs</h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg">Discover quick and comprehensive answers to common questions about our platform, services, and features.</p>
                </div>

                <div className="mt-6 md:mt-20">
                    <div className="space-y-12">
                        {faqItems.map((item) => (
                            <div
                                className="space-y-6"
                                key={item.group}
                                id={item.group.toLowerCase()}
                                data-faq-group={item.group.toLowerCase()}>
                                <h3 className="text-foreground border-b pb-6 text-lg font-semibold">{item.group}</h3>
                                <dl className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                                    {item.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="space-y-3">
                                            <div className="ring-border-illustration bg-card flex size-8 rounded-md shadow ring-1 *:m-auto *:size-4">{item.icon}</div>
                                            <dt className="text-foreground font-semibold">{item.question}</dt>
                                            <dd className="text-muted-foreground">{item.answer}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}