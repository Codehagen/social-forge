import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { TaskWorkspace } from "@/components/builder/task-workspace";

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

  const tasks = await prisma.builderTask.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (tasks.length === 0) {
    redirect("/builder");
  }

  const initialTask = tasks.find((task) => task.id === params.taskId) ?? null;
  if (!initialTask) {
    notFound();
  }

  return <TaskWorkspace initialTasks={tasks} initialTask={initialTask} currentTaskId={params.taskId} />;
}
