import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { TaskPageClient } from "@/components/builder/task-page-client";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export default async function BuilderTaskPage({ params }: RouteParams) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const existingTask = await prisma.builderTask.findFirst({
    where: { id: params.taskId, userId: session.user.id },
    select: { id: true },
  });

  if (!existingTask) {
    notFound();
  }

  const maxSandboxDuration = Number.parseInt(process.env.MAX_SANDBOX_DURATION ?? "300", 10);

  return <TaskPageClient taskId={params.taskId} maxSandboxDuration={maxSandboxDuration} />;
}
