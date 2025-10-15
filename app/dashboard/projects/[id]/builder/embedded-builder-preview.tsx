"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type EmbeddedBuilderPreviewProps = {
  projectName: string;
  builderHref: string;
  statusLabel: string;
  lastUpdatedLabel: string;
  previewUrl?: string | null;
  latestDeploymentUrl?: string;
};

export function EmbeddedBuilderPreview({
  projectName,
  builderHref,
  statusLabel,
  lastUpdatedLabel,
  previewUrl,
  latestDeploymentUrl,
}: EmbeddedBuilderPreviewProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="space-y-4 max-w-md">
          <h3 className="text-lg font-semibold">Builder Coming Soon</h3>
          <p className="text-muted-foreground">
            The embedded builder is currently being reimplemented. For now, you can use the full builder to edit your project.
          </p>
          <Button asChild>
            <Link href={builderHref}>
              Open Full Builder
            </Link>
          </Button>
          {previewUrl && (
            <p className="text-sm text-muted-foreground">
              <Link
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Live Site
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
