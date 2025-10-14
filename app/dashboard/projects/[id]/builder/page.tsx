import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBox } from "@tabler/icons-react";

import { getCurrentWorkspace } from "@/app/actions/workspace";
import { getSiteById } from "@/app/actions/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PageParams = { id: string };

type EmbeddedBuilderPageProps = {
  params: PageParams | Promise<PageParams>;
};

export default async function EmbeddedBuilderPage({
  params,
}: EmbeddedBuilderPageProps) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    notFound();
  }

  const { id } = await Promise.resolve(params);

  const project = await getSiteById(id, workspace.id).catch(() => null);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Embedded Builder
          </h1>
          <p className="text-muted-foreground">
            Work on “{project.name}” directly inside the dashboard.
          </p>
        </div>
        <Button asChild>
          <Link href={`/builder?siteId=${project.id}`}>
            Open current builder
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted/40">
              <IconBox className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Builder embed coming soon</CardTitle>
              <CardDescription>
                We&apos;re preparing an in-dashboard builder experience so you
                can iterate without leaving this page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 py-6">
          <p className="text-sm text-muted-foreground">
            Right now you can continue using the existing builder flow. Once the
            embedded editor is ready, you&apos;ll be able to:
          </p>
          <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            <li>Preview and edit the project without leaving the dashboard</li>
            <li>Track changes alongside project activity and status</li>
            <li>Send updates to clients as soon as you publish</li>
          </ul>
          <Button asChild variant="outline">
            <Link href={`/builder?siteId=${project.id}`}>
              Continue in standalone builder
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
