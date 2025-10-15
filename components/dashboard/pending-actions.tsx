import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PendingAction } from "@/app/actions/dashboard";
import {
  IconAlertCircle,
  IconCloudX,
  IconMail,
  IconArrowRight,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

type PendingActionsProps = {
  actions: PendingAction[];
};

function getActionIcon(type: PendingAction["type"]) {
  switch (type) {
    case "transfer":
      return <IconArrowRight className="h-4 w-4" />;
    case "deployment":
      return <IconCloudX className="h-4 w-4" />;
    case "invitation":
      return <IconMail className="h-4 w-4" />;
  }
}

function getActionColor(type: PendingAction["type"]): "default" | "destructive" | "secondary" {
  switch (type) {
    case "transfer":
      return "default";
    case "deployment":
      return "destructive";
    case "invitation":
      return "secondary";
  }
}

export function PendingActions({ actions }: PendingActionsProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Actions</CardTitle>
          <CardDescription>
            Items that need your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <IconAlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              All caught up! No pending actions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Actions</CardTitle>
        <CardDescription>
          {actions.length} item{actions.length !== 1 ? "s" : ""} need your attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="mt-0.5">
                <Badge variant={getActionColor(action.type)} className="h-8 w-8 rounded-full flex items-center justify-center p-0">
                  {getActionIcon(action.type)}
                </Badge>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{action.title}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(action.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </p>
                {action.type === "transfer" && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="default">
                      Review Transfer
                    </Button>
                  </div>
                )}
                {action.type === "deployment" && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      View Logs
                    </Button>
                    <Button size="sm" variant="ghost">
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
