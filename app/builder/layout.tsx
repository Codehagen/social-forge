import { ReactNode } from "react";
import prisma from "@/lib/prisma";
import { BuilderTasksProvider } from "@/components/builder/app-layout-context";
import { BuilderAppLayout } from "@/components/builder/app-layout";
import { getServerSession } from "@/lib/coding-agent/session";

export default async function BuilderLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  const tasks = session?.user?.id
    ? await prisma.builderTask.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <BuilderTasksProvider initialTasks={tasks}>
      <BuilderAppLayout>{children}</BuilderAppLayout>
    </BuilderTasksProvider>
  );
}
