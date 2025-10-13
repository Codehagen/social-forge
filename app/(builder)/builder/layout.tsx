import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Social Forge Builder",
  description: "Create websites from scratch with AI-powered website builder.",
};

export default async function BuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check authentication
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <link rel="stylesheet" href="/lovable/lovable.css" />
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </>
  );
}
