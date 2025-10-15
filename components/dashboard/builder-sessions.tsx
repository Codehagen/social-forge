import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import type { ActiveSession } from "@/app/actions/dashboard";
import { IconSparkles, IconArrowRight } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

type BuilderSessionsProps = {
  sessions: ActiveSession[];
};

function getUserInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function BuilderSessions({ sessions }: BuilderSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Builder Sessions</CardTitle>
          <CardDescription>
            AI-powered website building in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <IconSparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No active builder sessions
            </p>
            <Button asChild size="sm">
              <Link href="/builder">
                <IconSparkles className="h-4 w-4 mr-2" />
                Start Building
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Builder Sessions</CardTitle>
        <CardDescription>
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} in progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="mt-0.5">
                {session.user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconSparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {session.site ? (
                      <p className="font-medium text-sm">
                        Building: {session.site.name}
                      </p>
                    ) : (
                      <p className="font-medium text-sm">New Website Project</p>
                    )}
                    {session.promptSummary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {session.promptSummary}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Started{" "}
                      {formatDistanceToNow(new Date(session.startedAt), {
                        addSuffix: true,
                      })}
                      {session.user && ` by ${session.user.name || session.user.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" variant="default">
                    <Link href={session.site ? `/dashboard/projects/${session.site.id}/builder` : "/builder"}>
                      <IconArrowRight className="h-4 w-4 mr-1" />
                      Resume Session
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
