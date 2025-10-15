import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconGlobe, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

export function EmptyDashboardState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconGlobe className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No websites yet</EmptyTitle>
        <EmptyDescription>
          Start building your first website with our AI-powered builder. Answer a few questions and watch your site come to life.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link href="/builder">
              <IconSparkles className="h-5 w-5 mr-2" />
              Create Your First Website
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/projects">
              View All Projects
            </Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
