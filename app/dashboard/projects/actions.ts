'use server';

import { createSiteAction } from "@/app/actions/site";

export async function createTestProjectAction(workspaceId: string) {
  if (!workspaceId) {
    throw new Error("Workspace id is required");
  }

  const now = new Date();
  const timestamp = now.toISOString();
  const displayName = `Test Project ${timestamp.slice(0, 19).replace(/[:T]/g, "-")}`;

  const site = await createSiteAction(
    {
      name: displayName,
      brief: {
        industry: "Mock Services",
        summary:
          "Generated test project to help validate the project dashboard flow.",
        goals: [
          "Verify sorting and pagination wiring",
          "Demonstrate server action project creation",
        ],
      },
      metadata: {
        seed: timestamp,
        generatedBy: "dashboard-make-test-project",
      },
    },
    workspaceId
  );

  return site;
}
