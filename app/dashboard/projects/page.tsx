import { notFound } from "next/navigation";
import { listWorkspaceSites } from "@/app/actions/site";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { parseSortParam, toSiteOrderBy } from "@/components/projects/sort";
import ProjectsTable from "@/components/projects/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table as TableIcon } from "lucide-react";
import { MakeTestProjectButton } from "@/components/projects/make-test-project-button";

const DEFAULT_PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

type ProjectsPageProps = {
  searchParams: SearchParamsInput;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params =
    typeof (searchParams as PromiseLike<unknown>)?.then === "function"
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : ((searchParams as Record<string, string | string[] | undefined>) ?? {});

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    notFound();
  }

  const page = Number(firstValue(params.page) ?? "1") || 1;
  const limit = Math.min(
    Number(firstValue(params.limit) ?? DEFAULT_PAGE_SIZE.toString()) || DEFAULT_PAGE_SIZE,
    100
  );
  const offset = (page - 1) * limit;

  const sortDescriptors = parseSortParam(params.sort);
  const orderBy = toSiteOrderBy(sortDescriptors);

  const data = await listWorkspaceSites({
    workspaceId: workspace.id,
    limit,
    offset,
    sort: orderBy,
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage the websites your workspace is building.
          </p>
        </div>
        <MakeTestProjectButton workspaceId={workspace.id} />
      </div>

      {data.rows.length === 0 ? (
        <EmptyProjectsState workspaceId={workspace.id} />
      ) : (
        <ProjectsTable
          rows={data.rows}
          total={data.total}
          page={page}
          pageSize={limit}
          sort={sortDescriptors}
          workspaceId={workspace.id}
        />
      )}
    </div>
  );
}

function EmptyProjectsState({ workspaceId }: { workspaceId: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TableIcon className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No projects to display</EmptyTitle>
        <EmptyDescription>
          There are no projects yet. Seed a mock project to explore the workflow before inviting a client.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <MakeTestProjectButton workspaceId={workspaceId} />
      </EmptyContent>
    </Empty>
  );
}
