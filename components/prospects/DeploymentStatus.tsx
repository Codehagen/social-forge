import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { IconCheck, IconWorld } from "@tabler/icons-react";

interface DeploymentStatusProps {
  status: "deploying" | "live";
  domain: string;
}

export function DeploymentStatus({ status, domain }: DeploymentStatusProps) {
  if (status === "deploying") {
    return (
      <div className="flex w-full flex-col gap-4">
        <Item variant="muted">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">
              Deploying your website...
            </ItemTitle>
            <p className="text-sm text-muted-foreground">
              This usually takes 2-3 minutes
            </p>
          </ItemContent>
        </Item>

        <div className="rounded-lg bg-blue-500/10 p-4 text-sm">
          <p className="text-blue-700">
            <strong>What's happening?</strong>
          </p>
          <ul className="ml-4 mt-2 list-disc space-y-1 text-blue-600">
            <li>Building your website</li>
            <li>Optimizing assets</li>
            <li>Deploying to {domain}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Item variant="muted" className="border-green-200 bg-green-50/50">
        <ItemMedia>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <IconCheck className="h-5 w-5 text-white" />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-green-700">
            Your website is live!
          </ItemTitle>
          <p className="text-sm text-green-600">
            Successfully deployed to {domain}
          </p>
        </ItemContent>
        <ItemContent className="flex-none justify-end">
          <IconWorld className="h-5 w-5 text-green-600" />
        </ItemContent>
      </Item>

      <a
        href={`https://${domain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
      >
        Visit Your Website
      </a>
    </div>
  );
}
