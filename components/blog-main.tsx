"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useMedia } from "@/hooks/use-media";

const SHADCN_AVATAR = "https://avatars.githubusercontent.com/u/124599?v=4";
const MESCHAC_AVATAR = "https://avatars.githubusercontent.com/u/47919550?v=4";
const THEO_AVATAR = "https://avatars.githubusercontent.com/u/68236786?v=4";
const BERNARD_AVATAR = "https://avatars.githubusercontent.com/u/31113941?v=4";
const GLODIE_AVATAR = "https://avatars.githubusercontent.com/u/99137927?v=4";

type Category =
  | "company"
  | "marketing"
  | "newsroom"
  | "partners"
  | "engineering"
  | "press";

type Filter = "all" | Category;

interface Article {
  title: string;
  description: string;
  summary?: string;
  category: Category;
  image: string;
  date: string;
  href: string;
  authors: Author[];
}

interface Author {
  name: string;
  image: string;
}

export default function BlogMain() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const filters: Filter[] = [
    "all",
    "company",
    "marketing",
    "newsroom",
    "partners",
    "engineering",
    "press",
  ];

  const rawArticles: Article[] = [
    {
      title:
        "Embracing Remote Work Culture: Strategies for Success in a Distributed Workforce",
      description:
        "Explore the transformative shift towards remote work and how it has reshaped business operations globally.",
      summary:
        "Explore the transformative shift towards remote work and how it has reshaped business operations globally. Discover strategies for effective communication, collaboration, and productivity in a remote work environment.",
      category: "company",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755597459/blog-2_cazz7h.png",
      date: "Aug 18, 2025",
      href: "#",
      authors: [
        { name: "Shadcn", image: SHADCN_AVATAR },
        { name: "Meschac Irung", image: MESCHAC_AVATAR },
      ],
    },
    {
      title:
        "The Top Industries and Business Models Using AI for Fraud Prevention and Detection",
      description:
        "Discover how various industries leverage AI tools to enhance fraud prevention and detection.",
      summary:
        "Discover how various industries leverage AI tools to enhance fraud prevention and detection. Gain insights into the leading sectors and business models adopting AI technologies and learn about the effectiveness of these approaches.",
      category: "marketing",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755597459/blog-1_roo7z2.png",
      date: "Sep 10, 2025",
      href: "#",
      authors: [
        { name: "Theo Balick", image: THEO_AVATAR },
        { name: "Méschac Irung", image: MESCHAC_AVATAR },
      ],
    },
    {
      title: "Cutting-Edge Innovations in Data Analytics",
      description:
        "Learn about the latest trends in data analytics and how they can drive business growth.",
      summary:
        "Discover the latest innovations transforming data analytics into a powerful engine for growth. This article explores emerging tools, methods, and technologies that are redefining how businesses collect, analyze, and interpret data. Learn how advanced analytics empowers organizations to make smarter decisions, enhance customer experiences, and gain a competitive edge in today’s data-driven economy.",
      category: "company",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171585/dots-pattern_yfnqcy.jpg",
      date: "Oct 5, 2025",
      href: "#",
      authors: [
        { name: "Shadcn", image: SHADCN_AVATAR },
        { name: "Meschac Irung", image: MESCHAC_AVATAR },
      ],
    },
    {
      title: "Advancements in Cybersecurity Technologies",
      description:
        "Discover new technologies protecting businesses from digital threats.",
      summary:
        "The digital landscape is evolving, and so are the threats that businesses face. This article examines the latest advancements in cybersecurity, from AI-driven threat detection to zero-trust frameworks and quantum encryption. Learn how organizations are adopting these technologies to protect sensitive data, prevent cyberattacks, and build resilient infrastructures against an increasingly sophisticated threat environment.",
      category: "company",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525575/article-2_rey9it.png",
      date: "Oct 15, 2025",
      href: "#",
      authors: [{ name: "Meschac Irung", image: MESCHAC_AVATAR }],
    },
    {
      title: "The Role of Blockchain in Modern Finance",
      description:
        "Understand how blockchain is reshaping the financial landscape.",
      summary:
        "Blockchain technology is redefining the financial world by providing transparency, security, and efficiency in transactions. This article dives into the growing influence of blockchain in modern finance, from digital currencies and decentralized finance (DeFi) to cross-border payments and fraud prevention. Gain a deeper understanding of how financial institutions and startups alike are leveraging blockchain to create trustless, decentralized systems.",
      category: "marketing",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171584/dots-2_kmiukp.webp",
      date: "Nov 1, 2025",
      href: "#",
      authors: [{ name: "Theo Balick", image: THEO_AVATAR }],
    },
    {
      title: "Sustainability in Tech: A Growing Focus",
      description:
        "Explore efforts towards sustainable practices in technology.",
      summary:
        "As the tech industry grows, so does its environmental impact. This article explores how companies are shifting towards sustainable practices, from renewable energy data centers to eco-friendly hardware production and responsible e-waste management. Learn about the role of innovation, policy, and consumer demand in driving sustainability efforts and how technology leaders are shaping a greener digital future.",
      category: "marketing",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171585/dots-pattern_yfnqcy.jpg",
      date: "Nov 10, 2025",
      href: "#",
      authors: [{ name: "Shadcn", image: SHADCN_AVATAR }],
    },
    {
      title: "Big Data as a Strategic Asset",
      description: "See how big data analytics can unlock new opportunities.",
      summary:
        "Big data has become a cornerstone of modern business strategy. This article explains how organizations harness massive data sets to uncover patterns, predict trends, and personalize customer experiences. Discover real-world use cases across industries, the technologies enabling big data analytics, and practical ways businesses can unlock new opportunities, improve efficiency, and gain a competitive advantage.",
      category: "newsroom",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171590/time_djv8te.webp",
      date: "Dec 5, 2025",
      href: "#",
      authors: [{ name: "Bernard Ngandu", image: BERNARD_AVATAR }],
    },
    {
      title: "The Future of Business with Big Data",
      description: "See how big data analytics can unlock new opportunities.",
      summary:
        "Big data analytics is not just a trend—it is a necessity for forward-looking companies. In this article, explore how businesses are transforming operations and decision-making by adopting data-driven approaches. Learn about the role of cloud computing, machine learning, and predictive modeling in big data, and see how these innovations translate into new opportunities and measurable success.",
      category: "newsroom",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525573/article-3_tettwd.png",
      date: "Dec 5, 2025",
      href: "#",
      authors: [{ name: "Glodie Lukose", image: GLODIE_AVATAR }],
    },
    {
      title: "Turning Data into Business Growth",
      description:
        "See how big data analytics can unlock new opportunities insights and more from.",
      summary:
        "Data is the new currency in today’s digital age. This article provides an in-depth look at how big data analytics helps organizations generate actionable insights, enhance performance, and respond quickly to market changes. From customer behavior analysis to risk management, discover the wide-ranging applications of big data and how businesses are turning vast information into strategic growth.",
      category: "newsroom",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525575/article-2_rey9it.png",
      date: "Dec 5, 2025",
      href: "#",
      authors: [
        { name: "Bernard Ngandu", image: BERNARD_AVATAR },
        { name: "Shadcn", image: SHADCN_AVATAR },
      ],
    },
    {
      title: "Building a Strong Remote Work Culture",
      description:
        "Uncover the benefits and challenges of adopting a remote work culture in modern businesses.",
      summary:
        "Uncover the benefits and challenges of adopting a remote work culture in modern businesses. This article explores how remote work is reshaping company dynamics, offering greater flexibility while posing new challenges in communication and team management. Learn practical strategies to foster collaboration, maintain productivity, and build a strong company culture even when teams are distributed worldwide.",
      category: "company",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171590/time_djv8te.webp",
      date: "Aug 18, 2025",
      href: "#",
      authors: [{ name: "Meschac Irung", image: MESCHAC_AVATAR }],
    },
    {
      title: "The Transformative Future of AI in Digital Marketing",
      description:
        "Explore the potential of AI to revolutionize marketing strategies and customer engagement.",
      summary:
        "Artificial intelligence is transforming the marketing landscape by enabling personalization, automation, and data-driven insights at an unprecedented scale. This article explores the future of AI in digital marketing, highlighting tools and strategies that help brands engage customers more effectively. Discover how AI-powered chatbots, predictive analytics, and content generation are shaping the next era of customer experience.",
      category: "marketing",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525575/article-2_rey9it.png",
      date: "Sep 10, 2025",
      href: "#",
      authors: [
        { name: "Theo Balick", image: THEO_AVATAR },
        { name: "Méschac Irung", image: MESCHAC_AVATAR },
      ],
    },
    {
      title: "Emerging Trends in Data Analytics",
      description:
        "Learn about the latest trends in data analytics and how they can drive business growth.",
      summary:
        "Data analytics is evolving at a rapid pace, introducing innovative solutions that empower businesses to unlock deeper insights. This article examines the most cutting-edge innovations, including real-time analytics, natural language processing, and AI-driven forecasting. See how these advancements are revolutionizing industries, enabling companies to improve efficiency, and providing a roadmap for sustained growth.",
      category: "company",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171585/dots-pattern_yfnqcy.jpg",
      date: "Oct 5, 2025",
      href: "#",
      authors: [
        { name: "Shadcn", image: SHADCN_AVATAR },
        { name: "Meschac Irung", image: MESCHAC_AVATAR },
      ],
    },
    {
      title: "Next-Gen Cybersecurity Solutions",
      description:
        "Discover new technologies protecting businesses from digital threats.",
      summary:
        "Cybersecurity continues to advance to meet the challenges of an increasingly connected world. This article highlights the latest technologies keeping businesses safe, such as advanced encryption, AI-driven security operations, and proactive threat intelligence. Learn how organizations can stay ahead of cybercriminals, protect customer trust, and secure their digital ecosystems for the future.",
      category: "company",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525575/article-2_rey9it.png",
      date: "Oct 15, 2025",
      href: "#",
      authors: [{ name: "Meschac Irung", image: MESCHAC_AVATAR }],
    },
    {
      title: "Blockchain’s Impact on Global Finance",
      description:
        "Understand how blockchain is reshaping the financial landscape.",
      summary:
        "Blockchain is revolutionizing the financial sector by offering unprecedented levels of trust, speed, and transparency. This article breaks down its role in enabling decentralized finance (DeFi), enhancing payment systems, and securing digital assets. Explore how financial institutions are adopting blockchain solutions to reduce costs, increase efficiency, and respond to consumer demands for openness and security.",
      category: "marketing",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171584/dots-2_kmiukp.webp",
      date: "Nov 1, 2025",
      href: "#",
      authors: [{ name: "Theo Balick", image: THEO_AVATAR }],
    },
    {
      title: "The Push for Green Technology",
      description:
        "Explore efforts towards sustainable practices in technology.",
      summary:
        "The global push for sustainability is driving major changes in the technology industry. This article covers the initiatives companies are adopting, from renewable-powered data centers to circular economy practices and carbon-neutral operations. Learn how innovation and collaboration are making technology more eco-friendly and why sustainability is becoming a key differentiator in the industry.",
      category: "marketing",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171585/dots-pattern_yfnqcy.jpg",
      date: "Nov 10, 2025",
      href: "#",
      authors: [{ name: "Shadcn", image: SHADCN_AVATAR }],
    },
    {
      title: "Big Data Driving Innovation",
      description: "See how big data analytics can unlock new opportunities.",
      summary:
        "Big data analytics continues to be a driver of growth and innovation across industries. This article examines how organizations are using data to transform customer experiences, optimize operations, and develop new business models. Learn how to unlock the power of data responsibly and effectively to achieve long-term business success.",
      category: "newsroom",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171590/time_djv8te.webp",
      date: "Dec 5, 2025",
      href: "#",
      authors: [{ name: "Bernard Ngandu", image: BERNARD_AVATAR }],
    },
    {
      title: "Real-Time Insights with Big Data",
      description: "See how big data analytics can unlock new opportunities.",
      summary:
        "This article explores the transformative power of big data in reshaping industries. Discover how predictive analytics, machine learning, and AI are helping businesses gain real-time insights, forecast demand, and identify opportunities. Learn how organizations are scaling their data infrastructure to remain competitive in a rapidly changing market.",
      category: "newsroom",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525573/article-3_tettwd.png",
      date: "Dec 5, 2025",
      href: "#",
      authors: [{ name: "Glodie Lukose", image: GLODIE_AVATAR }],
    },
    {
      title: "From Data to Decisions",
      description:
        "See how big data analytics can unlock new opportunities insights and more from.",
      summary:
        "Harnessing big data has become essential for businesses aiming to innovate and thrive in today’s competitive market. This article examines key success stories and practical approaches to data analytics, including personalization, supply chain optimization, and fraud detection. Gain insights into the tools and best practices organizations are using to convert data into sustainable growth.",
      category: "newsroom",
      image:
        "https://res.cloudinary.com/dohqjvu9k/image/upload/v1755525575/article-2_rey9it.png",
      date: "Dec 5, 2025",
      href: "#",
      authors: [
        { name: "Bernard Ngandu", image: BERNARD_AVATAR },
        { name: "Shadcn", image: SHADCN_AVATAR },
      ],
    },
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<Filter, number> = {
      all: 0,
      company: 0,
      marketing: 0,
      newsroom: 0,
      partners: 0,
      engineering: 0,
      press: 0,
    };
    for (const a of rawArticles) {
      counts.all++;
      counts[a.category]++;
    }
    return counts;
  }, [rawArticles]);

  const articles = useMemo(
    () =>
      activeFilter === "all"
        ? rawArticles
        : rawArticles.filter((article) => article.category === activeFilter),
    [rawArticles, activeFilter]
  );
  const topArticles = useMemo(() => articles.slice(0, 2), [articles]);

  const moreArticles = useMemo(() => {
    const topKeys = new Set(
      topArticles.map((a) => `${a.title}|${a.date}|${a.href}`)
    );
    return articles
      .slice(2)
      .filter((a) => !topKeys.has(`${a.title}|${a.date}|${a.href}`));
  }, [articles, topArticles]);

  const isMobile = useMedia("(max-width: 640px)");
  const isMedium = useMedia("(min-width: 641px) and (max-width: 1024px)");

  const lastArticles = isMobile ? 1 : isMedium ? 2 : 3;

  return (
    <section className="bg-background">
      <div className="bg-muted @container py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-md">
            <span className="text-muted-foreground">Blog</span>
            <h2 className="text-muted-foreground mt-4 text-balance text-4xl font-semibold">
              News, insights and more from{" "}
              <strong className="text-foreground font-semibold">
                Tailark Quartz
              </strong>
            </h2>
          </div>

          <div className="-ml-0.5 mb-6 mt-12 flex justify-between gap-4 max-md:-mx-6 md:mt-16">
            <div
              className="-ml-0.5 flex snap-x snap-mandatory overflow-x-auto py-3 max-md:px-6"
              role="tablist"
              aria-label="Blog categories"
            >
              {filters.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFilter(category)}
                  disabled={categoryCounts[category] === 0}
                  role="tab"
                  aria-selected={activeFilter === category}
                  className="text-muted-foreground group snap-center px-1 disabled:pointer-events-none disabled:opacity-50"
                >
                  <span
                    className={cn(
                      "flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors [&>svg]:size-4",
                      activeFilter === category
                        ? "bg-card ring-foreground/5 text-primary font-medium shadow-sm ring-1"
                        : "hover:text-foreground group-hover:bg-foreground/5"
                    )}
                  >
                    <span className="capitalize">{category}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12">
              {topArticles.map((article, index) => (
                <div
                  key={`${article.title}-${article.date}-${index}`}
                  className="group relative"
                >
                  <article className="group relative space-y-6 rounded-xl">
                    <div className="bg-card/75 ring-border-illustration hover:bg-card/50 rounded-xl border border-transparent p-0.5 shadow-md ring-1">
                      <div className="before:border-border-illustration relative aspect-video overflow-hidden rounded-[10px] before:absolute before:inset-0 before:rounded-[10px] before:border">
                        <Image
                          src={article.image}
                          alt={article.title}
                          width={6394}
                          height={4500}
                          className="h-full w-full object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          loading={index < 3 ? "eager" : "lazy"}
                          priority={index === 0}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 p-0.5">
                      <time
                        className="text-muted-foreground text-sm"
                        dateTime={new Date(article.date).toISOString()}
                      >
                        {article.date}
                      </time>
                      <h2 className="text-foreground text-balance text-lg font-semibold md:text-xl">
                        <Link
                          href={article.href}
                          className="before:absolute before:inset-0"
                        >
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground">
                        {article.description}
                      </p>

                      <div className="grid grid-cols-[1fr_auto] items-end gap-2 pt-4">
                        <div className="space-y-2">
                          {article.authors.map((author, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-[auto_1fr] items-center gap-2"
                            >
                              <div className="ring-border-illustration bg-card aspect-square size-6 overflow-hidden rounded-md border border-transparent shadow-md shadow-black/15 ring-1">
                                <img
                                  src={author.image}
                                  alt={author.name}
                                  width={460}
                                  height={460}
                                  className="size-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <span className="text-muted-foreground line-clamp-1 text-sm">
                                {author.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex h-6 items-center">
                          <span
                            aria-label={`Read ${article.title}`}
                            className="text-primary group-hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                          >
                            Read
                            <ChevronRight
                              strokeWidth={2.5}
                              aria-hidden="true"
                              className="size-3.5 translate-y-px duration-200 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {moreArticles.length > 0 && (
            <div className="mt-12 md:mt-16">
              <div className="relative space-y-8">
                <h2 className="text-foreground text-2xl font-semibold">
                  More Articles
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
                  {moreArticles.map((article, index) => (
                    <article
                      key={`${article.title}-${article.date}-${index}`}
                      className="group relative space-y-4 duration-200"
                    >
                      <div className="bg-card/75 ring-border-illustration hover:bg-card/50 rounded-xl border border-transparent p-0.5 shadow-md ring-1">
                        <div className="before:border-border-illustration relative aspect-video overflow-hidden rounded-[10px] before:absolute before:inset-0 before:rounded-[10px] before:border">
                          <Image
                            src={article.image}
                            alt={article.title}
                            width={6394}
                            height={4500}
                            className="h-full w-full object-cover"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            loading={index < 3 ? "eager" : "lazy"}
                            priority={index === 0}
                          />
                        </div>
                      </div>
                      <time
                        className="text-muted-foreground text-sm"
                        dateTime={new Date(article.date).toISOString()}
                      >
                        {article.date}
                      </time>
                      <h3 className="text-foreground font-semibold">
                        <Link
                          href={article.href}
                          className="before:absolute before:inset-0"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground">
                        {article.description}
                      </p>

                      <div className="grid grid-cols-[1fr_auto] items-end gap-2 pt-4">
                        <div className="space-y-2">
                          {article.authors.map((author, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-[auto_1fr] items-center gap-2"
                            >
                              <div className="ring-border-illustration bg-card aspect-square size-6 overflow-hidden rounded-md border border-transparent shadow-md shadow-black/15 ring-1">
                                <img
                                  src={author.image}
                                  alt={author.name}
                                  width={460}
                                  height={460}
                                  className="size-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <span className="text-muted-foreground line-clamp-1 text-sm">
                                {author.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex h-6 items-center">
                          <span
                            aria-label={`Read ${article.title}`}
                            className="text-primary group-hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                          >
                            Read
                            <ChevronRight
                              strokeWidth={2.5}
                              aria-hidden="true"
                              className="size-3.5 translate-y-px duration-200 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
