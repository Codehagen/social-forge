import { Badge } from "@/components/ui/badge";
import { DomainStatus as DomainStatusEnum } from "@prisma/client";
import {
  IconCheck,
  IconClock,
  IconLoader,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";

interface DomainStatusProps {
  status: DomainStatusEnum;
  className?: string;
  showIcon?: boolean;
}

export function DomainStatus({
  status,
  className,
  showIcon = true,
}: DomainStatusProps) {
  const config = getDomainStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={className}
    >
      {showIcon && <config.icon className="mr-1.5 h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}

function getDomainStatusConfig(status: DomainStatusEnum) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        icon: IconCheck,
        variant: "default" as const,
        description: "Domain is verified and active",
        color: "text-green-600",
        bgColor: "bg-green-500/10",
      };
    case "PENDING_VERIFICATION":
      return {
        label: "Pending Verification",
        icon: IconClock,
        variant: "secondary" as const,
        description: "Waiting for DNS records to be configured",
        color: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
      };
    case "VERIFYING":
      return {
        label: "Verifying",
        icon: IconLoader,
        variant: "outline" as const,
        description: "Checking DNS configuration",
        color: "text-blue-600",
        bgColor: "bg-blue-500/10",
      };
    case "FAILED":
      return {
        label: "Verification Failed",
        icon: IconAlertTriangle,
        variant: "destructive" as const,
        description: "DNS verification failed",
        color: "text-red-600",
        bgColor: "bg-red-500/10",
      };
    case "REMOVED":
      return {
        label: "Removed",
        icon: IconX,
        variant: "outline" as const,
        description: "Domain has been removed",
        color: "text-gray-600",
        bgColor: "bg-gray-500/10",
      };
    default:
      return {
        label: "Unknown",
        icon: IconClock,
        variant: "outline" as const,
        description: "Unknown status",
        color: "text-gray-600",
        bgColor: "bg-gray-500/10",
      };
  }
}

export function getDomainStatusMeta(status: DomainStatusEnum) {
  return getDomainStatusConfig(status);
}
