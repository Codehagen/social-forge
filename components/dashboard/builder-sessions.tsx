import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActiveSession } from "@/app/actions/dashboard";
import { IconSparkles, IconClock } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type BuilderSessionsProps = {
  sessions: ActiveSession[];
};

export function BuilderSessions({ sessions }: BuilderSessionsProps) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSparkles className="h-5 w-5" />
          Active Builder Sessions
        </CardTitle>
        <CardDescription>
          Currently active AI website building sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <IconSparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {session.site?.name || "New Project"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.name || session.user?.email || "Unknown user"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex items-center gap-1 text-xs">
                    <IconClock className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {session.promptSummary || "Building website with AI assistance"}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Started {formatDistanceToNow(session.startedAt, { addSuffix: true })}
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/projects/${session.site?.id}/builder`}>
                      View Session
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
