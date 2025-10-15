import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ActivityItem } from "@/app/actions/dashboard";
import {
  IconPlus,
  IconRocket,
  IconSparkles,
  IconUserPlus,
  IconCheck,
  IconActivity,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

type ActivityFeedProps = {
  activities: ActivityItem[];
};

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "site_created":
      return <IconPlus className="h-4 w-4" />;
    case "site_deployed":
      return <IconRocket className="h-4 w-4" />;
    case "session_completed":
      return <IconSparkles className="h-4 w-4" />;
    case "member_joined":
      return <IconUserPlus className="h-4 w-4" />;
    case "transfer_completed":
      return <IconCheck className="h-4 w-4" />;
    case "version_created":
      return <IconPlus className="h-4 w-4" />;
  }
}

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

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your workspace activity will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <IconActivity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No activity yet. Start building to see updates here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates in your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="mt-0.5">
                {activity.user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(activity.user.name, activity.user.email)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {activity.user.name || activity.user.email}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
