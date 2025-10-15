import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Open Startup | Social Forge",
  description:
    "All our metrics, finances, and learnings are public. Explore our transparent journey.",
};

const topLevelStats = [
  { label: "Stargazers", value: "11,730" },
  { label: "Forks", value: "2,039" },
  { label: "Open Issues", value: "144" },
  { label: "Merged PR's", value: "1,010" },
];

const teamMembers = [
  {
    name: "Timur Ercan",
    role: "Co-Founder, CEO",
    startDate: "November 14th, 2022",
    status: "Full-time",
    location: "Germany",
    salary: "$95,000",
  },
  {
    name: "Lucas Smith",
    role: "Co-Founder, CTO",
    startDate: "April 19th, 2023",
    status: "Full-time",
    location: "Australia",
    salary: "$95,000",
  },
  {
    name: "Ephraim Atta-Duncan",
    role: "Software Engineer - I",
    startDate: "June 6th, 2023",
    status: "Full-time",
    location: "Ghana",
    salary: "$60,000",
  },
  {
    name: "David Nguyen",
    role: "Software Engineer - III",
    startDate: "July 26th, 2023",
    status: "Full-time",
    location: "Australia",
    salary: "$100,000",
  },
  {
    name: "Catalin-Marinel Pit",
    role: "Software Engineer - II",
    startDate: "September 4th, 2023",
    status: "Full-time",
    location: "Romania",
    salary: "$80,000",
  },
];

const salaryBands = [
  {
    role: "Software Engineer - Intern",
    level: "Intern",
    salary: "$30,000",
  },
  {
    role: "Software Engineer - I",
    level: "Junior",
    salary: "$60,000",
  },
  {
    role: "Software Engineer - II",
    level: "Mid",
    salary: "$80,000",
  },
  {
    role: "Software Engineer - III",
    level: "Senior",
    salary: "$100,000",
  },
  {
    role: "Software Engineer - IV",
    level: "Principal",
    salary: "$120,000",
  },
  {
    role: "Designer - III",
    level: "Senior",
    salary: "$100,000",
  },
  {
    role: "Designer - IV",
    level: "Principal",
    salary: "$120,000",
  },
  {
    role: "Marketer - I",
    level: "Junior",
    salary: "$50,000",
  },
  {
    role: "Marketer - II",
    level: "Mid",
    salary: "$65,000",
  },
  {
    role: "Marketer - III",
    level: "Senior",
    salary: "$80,000",
  },
];

const fundraisingTimeline = [
  { label: "May 2023", amount: "$290,000" },
  { label: "July 2023", amount: "$1,540,000" },
];

const capTable = [
  { label: "Founders", value: "75.5%" },
  { label: "Investors", value: "14.5%" },
  { label: "Team Pool", value: "10%" },
];

export default function OpenStartupPage() {
  return (
    <main className="bg-[#040308] text-slate-100">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="from-lime-500/10 via-transparent to-transparent absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))]" />
        </div>
        <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col gap-6 px-6 py-24 text-center sm:py-32 md:py-40">
          <span className="mx-auto inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.2em] text-lime-300/80">
            Open Startup
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            All our metrics, finances, and learnings are public. We believe in
            transparency and want to share our journey with you.
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-base text-slate-300 md:text-lg">
            You can read more about why here:{" "}
            <Link
              href="https://documenso.com/blog/announcing-open-metrics"
              className="text-lime-300 underline-offset-4 transition hover:text-lime-200 hover:underline"
            >
              Announcing Open Metrics
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#070815]">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
          {topLevelStats.map((stat) => (
            <Card
              key={stat.label}
              className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.04] p-6 text-left backdrop-blur-sm"
            >
              <span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                {stat.label}
              </span>
              <span className="text-3xl font-semibold text-lime-200 md:text-4xl">
                {stat.value}
              </span>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#080612]">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-lime-300/80">
              Team Documenso
            </span>
            <h2 className="max-w-3xl text-3xl font-semibold md:text-4xl">
              Meet the people building the future of open document signing.
            </h2>
            <p className="max-w-2xl text-slate-300">
              Role, start date, location, and salary are fully transparent for
              every member of the team.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="flex h-full flex-col gap-5 rounded-2xl border border-white/5 bg-white/[0.04] p-6 backdrop-blur"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-lime-200/80">{member.role}</p>
                </div>
                <dl className="flex flex-col gap-3 text-sm text-slate-300">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Start Date
                    </dt>
                    <dd className="mt-1 font-medium text-white">
                      {member.startDate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Status
                    </dt>
                    <dd className="mt-1 font-medium text-white">
                      {member.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Location
                    </dt>
                    <dd className="mt-1 font-medium text-white">
                      {member.location}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Salary
                    </dt>
                    <dd className="mt-1 font-medium text-white">
                      {member.salary}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#070815]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              Scrollbar Customizer
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Global Salary Bands
            </h2>
            <p className="max-w-2xl text-slate-300">
              Every role at Documenso fits one of the bands below. We publish
              them to make expectations clear for anyone considering a role.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 text-left text-sm uppercase tracking-[0.35em] text-slate-400">
              <div className="px-6 py-4">Role</div>
              <div className="px-6 py-4">Level</div>
              <div className="px-6 py-4">Salary</div>
            </div>
            <div className="divide-y divide-white/5">
              {salaryBands.map((band, index) => (
                <div
                  key={band.role}
                  className={`grid grid-cols-3 text-sm transition ${
                    index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                  }`}
                >
                  <div className="px-6 py-4 font-medium text-white">
                    {band.role}
                  </div>
                  <div className="px-6 py-4 text-slate-300">{band.level}</div>
                  <div className="px-6 py-4 font-semibold text-lime-200">
                    {band.salary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#040308]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-8 rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-300/80">
                Finances
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                Total Funding Raised
              </h2>
            </div>
            <div className="space-y-6">
              {fundraisingTimeline.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-baseline justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      {entry.label}
                    </span>
                    <span className="text-2xl font-semibold text-lime-200 md:text-3xl">
                      {entry.amount}
                    </span>
                  </div>
                  <div className="h-14 w-14 rounded-full border border-lime-300/40 bg-lime-300/10" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-300/80">
                Cap Table
              </span>
              <p className="mt-3 text-sm text-slate-300">
                Ownership distribution across the company.
              </p>
            </div>
            <div className="space-y-5">
              {capTable.map((entry) => (
                <div key={entry.label} className="flex items-center gap-3">
                  <div className="flex-1 rounded-full bg-white/[0.08]">
                    <div
                      className="h-3 rounded-full bg-lime-300"
                      style={{ width: entry.value }}
                    />
                  </div>
                  <div className="w-[5.5rem] text-sm font-medium text-white">
                    {entry.value}
                  </div>
                  <div className="text-sm text-slate-300">{entry.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
