import { ReactNode } from "react";
import prisma from "@/lib/prisma";
import { BuilderTasksProvider } from "@/components/builder/app-layout-context";
import { AppLayoutWrapper } from "@/components/builder/app-layout-wrapper";
import { getServerSession } from "@/lib/coding-agent/session";
import { cookies, headers } from "next/headers";
import { getSidebarWidthFromCookie, getSidebarOpenFromCookie } from "@/lib/coding-agent/cookies";

export default async function BuilderLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  const tasks = session?.user?.id
    ? await prisma.builderTask.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Get initial sidebar state from cookies
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  const initialSidebarWidth = getSidebarWidthFromCookie(cookieString);
  const initialSidebarOpen = getSidebarOpenFromCookie(cookieString);

  // Detect if mobile from user agent
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return (
    <BuilderTasksProvider 
      initialTasks={tasks}
      initialSidebarOpen={initialSidebarOpen}
      initialSidebarWidth={initialSidebarWidth}
    >
      <AppLayoutWrapper 
        initialSidebarWidth={initialSidebarWidth}
        initialSidebarOpen={initialSidebarOpen}
        initialIsMobile={isMobile}
      >
        {children}
      </AppLayoutWrapper>
    </BuilderTasksProvider>
  );
}
