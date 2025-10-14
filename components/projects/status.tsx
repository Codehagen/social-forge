import type { ComponentType } from "react";
import {
  IconArchive,
  IconArrowRight,
  IconCircleCheckFilled,
  IconClock,
  IconLoader,
} from "@tabler/icons-react";
import type { SiteStatus } from "@prisma/client";

import {
  SITE_STATUS_VALUES,
  type SiteStatusValue,
} from "./config";

export type StatusMeta = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
};

const STATUS_META_MAP: Record<SiteStatusValue, StatusMeta> = {
  LIVE: {
    label: "Live",
    icon: IconCircleCheckFilled,
    iconClassName: "h-3.5 w-3.5 fill-green-500 text-green-500",
  },
  READY_FOR_TRANSFER: {
    label: "Ready For Transfer",
    icon: IconArrowRight,
    iconClassName: "h-3.5 w-3.5 text-blue-500",
  },
  REVIEW: {
    label: "Review",
    icon: IconLoader,
    iconClassName: "h-3.5 w-3.5 animate-spin text-amber-500",
  },
  ARCHIVED: {
    label: "Archived",
    icon: IconArchive,
    iconClassName: "h-3.5 w-3.5 text-muted-foreground",
  },
  DRAFT: {
    label: "Draft",
    icon: IconClock,
    iconClassName: "h-3.5 w-3.5 text-muted-foreground",
  },
};

const DEFAULT_STATUS_META: StatusMeta = {
  label: "Unknown",
  icon: IconClock,
  iconClassName: "h-3.5 w-3.5 text-muted-foreground",
};

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (word) => word.toUpperCase());
}

export function getStatusMeta(
  status: SiteStatus | SiteStatusValue
): StatusMeta {
  const normalized = status as SiteStatusValue;
  const meta = STATUS_META_MAP[normalized];
  if (meta) {
    return meta;
  }
  return {
    ...DEFAULT_STATUS_META,
    label: formatStatusLabel(String(status)),
  };
}

export const STATUS_FILTER_OPTIONS = SITE_STATUS_VALUES.map((value) => {
  const meta = getStatusMeta(value);
  return {
    label: meta.label,
    value,
    icon: meta.icon,
  };
});
