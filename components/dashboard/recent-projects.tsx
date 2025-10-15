import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { RecentProject } from "@/app/actions/dashboard";
import { IconExternalLink, IconCode } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

type RecentProjectsProps = {
  projects: RecentProject[];
};

function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "LIVE":
      return "default";
    case "REVIEW":
      return "secondary";
    case "DRAFT":
      return "outline";
    case "READY_FOR_TRANSFER":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "LIVE":
      return "Live";
    case "REVIEW":
      return "In Review";
    case "DRAFT":
      return "Draft";
    case "READY_FOR_TRANSFER":
      return "Ready for Transfer";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>
          Your most recently updated websites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{project.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        /{project.slug}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(project.status)} className="ml-2 shrink-0">
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  {project.client && (
                    <div className="text-xs text-muted-foreground">
                      Client: {project.client.name}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconCode className="h-3 w-3" />
                      <span>{project._count.versions} version{project._count.versions !== 1 ? "s" : ""}</span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(project.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/dashboard/projects/${project.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/projects/${project.id}/builder`}>
                        <IconExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
