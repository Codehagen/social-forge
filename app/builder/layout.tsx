import { AppLayout } from "@/components/app-layout";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
