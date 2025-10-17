import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/actions/user";

const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/control-room",
  },
  {
    title: "Affiliate approvals",
    href: "/control-room/affiliates",
  },
];

type ControlRoomLayoutProps = {
  children: React.ReactNode;
};

export default async function ControlRoomLayout({
  children,
}: ControlRoomLayoutProps) {
  const user = await getCurrentUser();

  if (!user || (!user.superAdmin && !user.agent)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Control room
            </h1>
            <p className="text-sm text-muted-foreground">
              Operate the platform, review partner programs, and keep revenue
              healthy.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
