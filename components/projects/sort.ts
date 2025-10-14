import { z } from "zod";
import { Prisma } from "@prisma/client";

export const siteSortFields = [
  "name",
  "status",
  "createdAt",
  "updatedAt",
  "client",
] as const;

export type SiteSortField = (typeof siteSortFields)[number];

export type SortDescriptor = {
  id: SiteSortField;
  desc?: boolean;
};

const sortItemSchema = z.object({
  id: z.enum(siteSortFields),
  desc: z.coerce.boolean().optional(),
});

const sortSchema = z
  .array(sortItemSchema)
  .max(3)
  .optional()
  .default([{ id: "createdAt", desc: true }]);

export function parseSortParam(
  raw: string | string[] | null | undefined
): SortDescriptor[] {
  if (!raw) {
    return sortSchema.parse(undefined);
  }

  const value = Array.isArray(raw) ? raw[0] : raw;

  try {
    if (value.startsWith("[")) {
      const parsed = JSON.parse(value);
      return sortSchema.parse(parsed);
    }
  } catch (error) {
    console.warn("[projects] failed to parse sort param - falling back", error);
  }

  return sortSchema.parse(undefined);
}

export function serializeSortParam(sort: SortDescriptor[]): string {
  return JSON.stringify(sort);
}

export function toSiteOrderBy(
  sort: SortDescriptor[]
): Prisma.SiteOrderByWithRelationInput[] {
  const fallbacks: SortDescriptor[] = [{ id: "createdAt", desc: true }];
  const descriptors = sort.length ? sort : fallbacks;

  return descriptors.map((descriptor) => {
    const direction = descriptor.desc ? "desc" : "asc";

    switch (descriptor.id) {
      case "name":
      case "status":
      case "createdAt":
      case "updatedAt":
        return { [descriptor.id]: direction };
      case "client":
        return {
          client: {
            name: direction,
          },
        };
      default:
        return { createdAt: "desc" };
    }
  });
}
