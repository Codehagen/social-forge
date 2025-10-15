import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Rocket, Globe, AlertCircle } from "lucide-react";

interface Site {
  name: string;
}

interface Workspace {
  businessName?: string | null;
  name: string;
}

interface ProspectApprovalHeaderProps {
  siteName: string;
  prospectName?: string | null;
  status: string;
  message?: string | null;
  workspace: Workspace;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
      };
    case "LIVE":
      return {
        label: "Live",
        icon: Globe,
        className: "bg-green-100 text-green-800 border-green-200",
      };
    case "DECLINED":
      return {
        label: "Declined",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        icon: AlertCircle,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
    case "DEPLOYING":
      return {
        label: "Deploying",
        icon: Rocket,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "DETAILS_SUBMITTED":
      return {
        label: "Processing",
        icon: Clock,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "VIEWED":
      return {
        label: "Viewed",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    default: // PENDING
      return {
        label: "Pending Review",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
  }
};

export function ProspectApprovalHeader({
  siteName,
  prospectName,
  status,
  message,
  workspace,
}: ProspectApprovalHeaderProps) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative">
      {/* Gradient background similar to hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-32 max-w-2xl rounded-b-full bg-gradient-to-b from-purple-100/50 via-amber-50/30 to-transparent blur-3xl"
      />

      <div className="relative text-center space-y-8">
        {/* Status badge */}
        <div className="flex justify-center">
          <Badge
            className={`${statusConfig.className} text-xs font-medium px-3 py-1 border`}
          >
            <StatusIcon className="h-3 w-3 mr-1.5" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Main heading matching hero style */}
        <div className="space-y-4">
          <h1 className="text-foreground text-balance text-3xl font-semibold sm:text-4xl md:text-5xl">
            {siteName}
          </h1>
          <p className="text-muted-foreground text-balance text-lg max-w-3xl mx-auto">
            Review your custom website and provide feedback
          </p>
        </div>

        {/* Agency info */}
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Created by {workspace.businessName || workspace.name}</span>
        </div>

        {/* Prospect greeting card */}
        {prospectName && (
          <div className="ring-foreground/10 bg-card rounded-2xl border-transparent p-6 shadow-sm ring-1 max-w-2xl mx-auto">
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome, {prospectName}
                </h2>
              </div>
              {message && (
                <p className="text-sm text-muted-foreground text-balance whitespace-pre-wrap">
                  {message}
                </p>
              )}
              {status !== "LIVE" && status !== "DECLINED" && status !== "EXPIRED" && (
                <p className="text-sm text-muted-foreground text-balance">
                  Please review the website preview below and let us know your thoughts.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
