import Link from 'next/link'

const links = [
    {
        group: 'Product',
        items: [
            {
                title: 'Overview',
                href: '/',
            },
            {
                title: 'Pricing',
                href: '/pricing',
            },
            {
                title: 'Integrations',
                href: '/integrations',
            },
            {
                title: 'Affiliate',
                href: '/affiliate',
            },
            {
                title: 'Customers',
                href: '/customers',
            },
        ],
    },
    {
        group: 'Resources',
        items: [
            {
                title: 'Blog',
                href: '/blog',
            },
            {
                title: 'Help Center',
                href: '/help',
            },
            {
                title: 'Getting Started Guides',
                href: '/help/category/getting-started',
            },
            {
                title: 'Agency Playbooks',
                href: '/help/category/for-investors',
            },
            {
                title: 'Brand Assets',
                href: '/brand',
            },
            {
                title: 'OSS Friends',
                href: '/oss-friends',
            },
            {
                title: 'Component Library',
                href: '/brand/components',
            },
        ],
    },
    {
        group: 'Company',
        items: [
            {
                title: 'About',
                href: '/about',
            },
            {
                title: 'Company Hub',
                href: '/company',
            },
            {
                title: 'Open Startup',
                href: '/open',
            },
            {
                title: 'Contact',
                href: '/contact',
            },
            {
                title: 'Sign Up',
                href: '/sign-up',
            },
            {
                title: 'Sign In',
                href: '/sign-in',
            },
        ],
    },
    {
        group: 'Legal',
        items: [
            {
                title: 'Privacy Policy',
                href: '/privacy',
            },
            {
                title: 'Terms of Service',
                href: '/terms',
            },
        ],
    },
]

export default function FooterSection() {
    return (
        <footer
            role="contentinfo"
            className="bg-muted py-8 sm:py-20">
            <div className="mx-auto max-w-5xl space-y-16 px-6">
                <div className="grid gap-12 md:grid-cols-5">
                    <div className="space-y-6 md:col-span-2 md:space-y-12">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="block size-fit">
                            <span className="h-5 flex items-center text-foreground font-semibold">Social Forge</span>
                        </Link>

                        <p className="text-muted-foreground text-balance text-sm">
                            Social Forge helps agencies build AI-powered websites faster with collaborative workflows.
                        </p>
                    </div>

                    <div className="col-span-3 grid gap-6 sm:grid-cols-3 md:grid-cols-5">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="space-y-4 text-sm">
                                <span className="block font-medium">{link.group}</span>

                                <div className="flex flex-wrap gap-4 sm:flex-col">
                                    {link.items.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className="text-muted-foreground hover:text-primary block duration-150">
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="space-y-4 sm:hidden md:block">
                            <span className="block font-medium">Community</span>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <Link
                                    href="https://twitter.com/socialforgetech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="X/Twitter"
                                    className="text-muted-foreground hover:text-primary block">
                                    <svg
                                        className="size-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"></path>
                                    </svg>
                                </Link>
                                <Link
                                    href="https://www.linkedin.com/company/socialforge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    className="text-muted-foreground hover:text-primary block">
                                    <svg
                                        className="size-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"></path>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    aria-hidden
                    className="h-px bg-[length:6px_1px] bg-repeat-x opacity-25 [background-image:linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)]"
                />
                <div className="flex flex-wrap justify-between gap-4">
                    <span className="text-muted-foreground text-sm">© {new Date().getFullYear()} Social Forge. All rights reserved.</span>

                    <div className="ring-foreground/5 bg-card flex items-center gap-2 rounded-full border border-transparent py-1 pl-2 pr-4 shadow ring-1">
                        <div className="relative flex size-3">
                            <span className="duration-1500 absolute inset-0 block size-full animate-pulse rounded-full bg-emerald-100"></span>
                            <span className="relative m-auto block size-1 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-sm">All Systems Normal</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
