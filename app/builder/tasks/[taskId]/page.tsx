import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { TaskPageClient } from "@/components/builder/task-page-client";

type RouteParams = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function BuilderTaskPage({ params }: RouteParams) {
  const { taskId } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const existingTask = await prisma.builderTask.findFirst({
    where: { id: taskId, userId: session.user.id },
    select: { id: true },
  });

  if (!existingTask) {
    notFound();
  }

  const maxSandboxDuration = Number.parseInt(process.env.MAX_SANDBOX_DURATION ?? "300", 10);

  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null;

  const authProvider = (session as { lastLoginMethod?: string | null } | null)?.lastLoginMethod ?? null;

  return (
    <TaskPageClient
      taskId={taskId}
      maxSandboxDuration={maxSandboxDuration}
      user={user}
      authProvider={authProvider}
    />
  );
}
