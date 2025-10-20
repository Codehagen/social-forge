import { constructMetadata } from "@/lib/constructMetadata";
import { BuilderApp } from "@/components/builder/builder-app";

export const metadata = constructMetadata({
  title: "Builder - Social Forge",
  description: "AI Website Builder interface for Social Forge.",
  noIndex: true,
});

export default function BuilderPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Coding Agent Workspace</h1>
        <p className="max-w-3xl text-muted-foreground">
          Launch automated coding tasks inside an isolated Vercel sandbox. Describe the change you want,
          point to a repository, and let the agent handle implementation, testing, and git operations.
        </p>
      </div>
      <BuilderApp />
    </div>
  );
}
