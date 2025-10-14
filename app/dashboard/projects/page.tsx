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
import Link from "next/link";
import { Suspense } from "react";
import { Filter, Table as TableIcon } from "lucide-react";
import { MakeTestProjectButton } from "@/components/projects/make-test-project-button";
import {
  DEFAULT_PAGE_SIZE,
  parseLimitParam,
  parsePageParam,
  parseSearchParam,
  parseStatusesParam,
} from "@/components/projects/config";
import type { SiteStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import ProjectsLoading from "./loading";

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

  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsPageContent params={params} workspaceId={workspace.id} />
    </Suspense>
  );
}

async function ProjectsPageContent({
  params,
  workspaceId,
}: {
  params: Record<string, string | string[] | undefined>;
  workspaceId: string;
}) {
  const page = parsePageParam(params.page, 1);
  const limit = parseLimitParam(params.limit, DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * limit;

  const sortDescriptors = parseSortParam(params.sort);
  const orderBy = toSiteOrderBy(sortDescriptors);
  const search = parseSearchParam(params.search);
  const statuses = parseStatusesParam(params.status);

  const data = await listWorkspaceSites({
    workspaceId,
    limit,
    offset,
    search: search || undefined,
    statuses: (statuses?.length ? statuses : undefined) as
      | SiteStatus[]
      | undefined,
    sort: orderBy,
  });

  const hasActiveFilters = Boolean(search) || statuses.length > 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage the websites your workspace is building.
          </p>
        </div>
        <MakeTestProjectButton workspaceId={workspaceId} />
      </div>

      {data.rows.length === 0 ? (
        hasActiveFilters ? (
          <FilteredProjectsState />
        ) : (
          <EmptyProjectsState workspaceId={workspaceId} />
        )
      ) : (
        <ProjectsTable
          rows={data.rows}
          total={data.total}
          page={page}
          pageSize={limit}
          sort={sortDescriptors}
          search={search}
          statusFilter={statuses}
          workspaceId={workspaceId}
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

function FilteredProjectsState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Filter className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No items match your filters</EmptyTitle>
        <EmptyDescription>
          Try adjusting your filters to see more results.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link href="/dashboard/projects">Clear filters</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
