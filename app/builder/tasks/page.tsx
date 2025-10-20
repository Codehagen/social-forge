import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { redirect } from "next/navigation";

export default async function BuilderTasksIndexPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const task = await prisma.builderTask.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!task) {
    redirect("/builder");
  }

  redirect(`/builder/tasks/${task.id}`);
}
