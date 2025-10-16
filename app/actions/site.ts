"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  SiteEnvironmentType,
  SiteStatus,
  Prisma,
  DomainStatus,
  SiteTransferStatus,
  SiteCollaboratorRole,
  DeploymentStatus,
} from "@prisma/client";
import {
  canSendEmail,
  sendEmail,
  DeploymentFailedEmail,
  SiteCollaboratorAddedEmail,
  SiteTransferRequestEmail,
  SiteTransferStatusEmail,
} from "@/lib/email";

type Json = Prisma.InputJsonValue;

type WorkspaceContext = {
  userId: string;
  workspaceId: string;
};

function optionalJson<T extends Json | null | undefined>(value: T) {
  return value === undefined ? undefined : value;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function resolveWorkspaceContext(
  workspaceId?: string
): Promise<WorkspaceContext> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let targetWorkspaceId = workspaceId ?? null;

  if (!targetWorkspaceId) {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        activeWorkspaceId: {
          not: null,
        },
      },
      select: {
        activeWorkspaceId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    targetWorkspaceId = activeSession?.activeWorkspaceId ?? null;
  }

  if (!targetWorkspaceId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        workspaceId: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });
    targetWorkspaceId = membership?.workspaceId ?? null;
  }

  if (!targetWorkspaceId) {
    throw new Error("Workspace not found");
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: targetWorkspaceId,
      },
    },
  });

  if (!membership) {
    throw new Error("Not a member of this workspace");
  }

  return {
    userId: session.user.id,
    workspaceId: targetWorkspaceId,
  };
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.site.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function assertSiteOwnership(siteId: string, workspaceId: string) {
  const site = await prisma.site.findFirst({
    where: { id: siteId, workspaceId },
    select: {
      id: true,
      workspaceId: true,
      archivedAt: true,
      status: true,
      name: true,
    },
  });

  if (!site) {
    throw new Error("Site not found");
  }

  return site;
}

async function assertEnvironmentOwnership(
  environmentId: string,
  workspaceId: string
) {
  const environment = await prisma.siteEnvironment.findFirst({
    where: {
      id: environmentId,
      site: { workspaceId },
    },
    select: {
      id: true,
      siteId: true,
      type: true,
    },
  });

  if (!environment) {
    throw new Error("Environment not found");
  }

  return environment;
}

async function assertDomainOwnership(domainId: string, workspaceId: string) {
  const domain = await prisma.siteDomain.findFirst({
    where: {
      id: domainId,
      environment: {
        site: {
          workspaceId,
        },
      },
    },
    select: {
      id: true,
      environmentId: true,
      environment: {
        select: { siteId: true },
      },
    },
  });

  if (!domain) {
    throw new Error("Domain not found");
  }

  return domain;
}

async function assertVersionOwnership(versionId: string, workspaceId: string) {
  const version = await prisma.siteVersion.findFirst({
    where: {
      id: versionId,
      site: {
        workspaceId,
      },
    },
    select: {
      id: true,
      siteId: true,
      number: true,
      site: {
        select: {
          activeVersionId: true,
        },
      },
    },
  });

  if (!version) {
    throw new Error("Version not found");
  }

  return version;
}

async function assertDeploymentOwnership(
  deploymentId: string,
  workspaceId: string
) {
  const deployment = await prisma.siteDeployment.findFirst({
    where: {
      id: deploymentId,
      environment: {
        site: {
          workspaceId,
        },
      },
    },
    select: {
      id: true,
      environmentId: true,
      versionId: true,
      status: true,
      url: true,
      environment: {
        select: {
          id: true,
          name: true,
          site: {
            select: {
              id: true,
              name: true,
              workspace: {
                select: {
                  name: true,
                  businessName: true,
                  businessEmail: true,
                },
              },
            },
          },
        },
      },
      triggeredBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!deployment) {
    throw new Error("Deployment not found");
  }

  return deployment;
}

async function assertCollaboratorOwnership(
  collaboratorId: string,
  workspaceId: string
) {
  const collaborator = await prisma.siteCollaborator.findFirst({
    where: {
      id: collaboratorId,
      site: {
        workspaceId,
      },
    },
    select: {
      id: true,
      siteId: true,
    },
  });

  if (!collaborator) {
    throw new Error("Collaborator not found");
  }

  return collaborator;
}

async function assertTransferOwnership(
  transferId: string,
  workspaceId: string
) {
  const transfer = await prisma.siteTransfer.findFirst({
    where: {
      id: transferId,
      OR: [
        { fromWorkspaceId: workspaceId },
        { toWorkspaceId: workspaceId },
      ],
    },
    select: {
      id: true,
      siteId: true,
      status: true,
      fromWorkspaceId: true,
      toWorkspaceId: true,
      notes: true,
      initiatedAt: true,
      site: {
        select: {
          id: true,
          name: true,
        },
      },
      fromWorkspace: {
        select: {
          name: true,
          businessName: true,
          businessEmail: true,
        },
      },
      toWorkspace: {
        select: {
          name: true,
          businessName: true,
          businessEmail: true,
        },
      },
    },
  });

  if (!transfer) {
    throw new Error("Transfer not found");
  }

  return transfer;
}

async function assertClientOwnership(clientId: string, workspaceId: string) {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      workspaceId,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return client;
}


export type ListSitesOptions = {
  workspaceId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  statuses?: SiteStatus[];
  sort?: Prisma.SiteOrderByWithRelationInput[];
};

const siteListInclude = {
  client: true,
  activeVersion: true,
  environments: {
    include: {
      domains: true,
    },
  },
  versions: {
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 3,
  },
} satisfies Prisma.SiteInclude;

export type SiteListRow = Prisma.SiteGetPayload<{
  include: typeof siteListInclude;
}>;

export async function listWorkspaceSites(options: ListSitesOptions = {}) {
  const {
    workspaceId,
    limit = 20,
    offset = 0,
    search,
    sort,
  } = options;

  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const where: Prisma.SiteWhereInput = {
    workspaceId: scopedWorkspaceId,
  };

  if (search?.trim()) {
    where.OR = [
      {
        name: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
      {
        client: {
          name: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (options.statuses?.length) {
    where.status = {
      in: options.statuses,
    };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.site.findMany({
      where,
      include: siteListInclude,
      orderBy: sort && sort.length ? sort : [{ createdAt: "desc" }],
      take: limit,
      skip: offset,
    }),
    prisma.site.count({ where }),
  ]);

  return {
    rows,
    total,
  };
}

type CreateSiteInput = {
  name: string;
  slug?: string;
  status?: SiteStatus;
  brief?: Json;
  metadata?: Json;
  clientId?: string | null;
  builderWorkspaceId?: string | null;
  createDefaultEnvironments?: boolean;
};

export async function createSiteAction(
  input: CreateSiteInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const name = input.name?.trim();
  if (!name) {
    throw new Error("Site name is required");
  }

  const baseSlug = slugify(input.slug || name);
  if (!baseSlug) {
    throw new Error("Unable to generate slug");
  }

  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  if (input.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
      select: { workspaceId: true },
    });
    if (!client || client.workspaceId !== scopedWorkspaceId) {
      throw new Error("Invalid client for this workspace");
    }
  }

  const builderWorkspaceId = input.builderWorkspaceId ?? scopedWorkspaceId;

  const includesDefaultEnvironments = input.createDefaultEnvironments !== false;

  const site = await prisma.site.create({
    data: {
      name,
      slug: uniqueSlug,
      status: input.status ?? SiteStatus.DRAFT,
      brief: optionalJson(input.brief),
      metadata: optionalJson(input.metadata),
      clientId: input.clientId ?? undefined,
      workspaceId: scopedWorkspaceId,
      builderWorkspaceId,
      createdById: userId,
      environments: includesDefaultEnvironments
        ? {
            create: [
              {
                type: SiteEnvironmentType.DEVELOPMENT,
                name: "Development",
              },
              {
                type: SiteEnvironmentType.PREVIEW,
                name: "Preview",
              },
              {
                type: SiteEnvironmentType.PRODUCTION,
                name: "Production",
              },
            ],
          }
        : undefined,
    },
    include: {
      environments: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return site;
}

type UpdateSiteInput = {
  name?: string;
  slug?: string;
  status?: SiteStatus;
  brief?: Json | null;
  metadata?: Json | null;
  clientId?: string | null;
  builderWorkspaceId?: string | null;
  archivedAt?: Date | null;
};

export async function updateSiteAction(
  siteId: string,
  input: UpdateSiteInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const existing = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      workspaceId: true,
      slug: true,
    },
  });

  if (!existing || existing.workspaceId !== scopedWorkspaceId) {
    throw new Error("Site not found");
  }

  const updateData: Prisma.SiteUpdateInput = {};

  if (input.name) {
    updateData.name = input.name.trim();
  }

  if (input.slug) {
    const baseSlug = slugify(input.slug);
    if (!baseSlug) {
      throw new Error("Invalid slug");
    }

    const uniqueSlug =
      baseSlug === existing.slug
        ? existing.slug
        : await ensureUniqueSlug(baseSlug);
    updateData.slug = uniqueSlug;
  }

  if (input.status) {
    updateData.status = input.status;
  }

  if (input.brief !== undefined) {
    updateData.brief = optionalJson(input.brief);
  }

  if (input.metadata !== undefined) {
    updateData.metadata = optionalJson(input.metadata);
  }

  if (input.clientId !== undefined) {
    if (input.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: input.clientId },
        select: { workspaceId: true },
      });
      if (!client || client.workspaceId !== scopedWorkspaceId) {
        throw new Error("Invalid client for this workspace");
      }
    }
    updateData.client = input.clientId
      ? {
          connect: { id: input.clientId },
        }
      : { disconnect: true };
  }

  if (input.builderWorkspaceId !== undefined) {
    if (input.builderWorkspaceId) {
      const workspaceExists = await prisma.workspace.findUnique({
        where: { id: input.builderWorkspaceId },
        select: { id: true },
      });
      if (!workspaceExists) {
        throw new Error("Builder workspace not found");
      }
      updateData.builderWorkspace = {
        connect: { id: input.builderWorkspaceId },
      };
    } else {
      updateData.builderWorkspace = {
        disconnect: true,
      };
    }
  }

  if (input.archivedAt !== undefined) {
    updateData.archivedAt = input.archivedAt;
  }

  const site = await prisma.site.update({
    where: { id: siteId },
    data: updateData,
    include: {
      environments: true,
      activeVersion: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return site;
}

export async function archiveSiteAction(siteId: string, workspaceId?: string) {
  return updateSiteAction(
    siteId,
    { archivedAt: new Date(), status: SiteStatus.ARCHIVED },
    workspaceId
  );
}

export async function restoreSiteAction(siteId: string, workspaceId?: string) {
  return updateSiteAction(
    siteId,
    { archivedAt: null, status: SiteStatus.REVIEW },
    workspaceId
  );
}

export async function deleteSiteAction(siteId: string, workspaceId?: string) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const existing = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!existing || existing.workspaceId !== scopedWorkspaceId) {
    throw new Error("Site not found");
  }

  await prisma.site.delete({
    where: { id: siteId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function getSiteById(siteId: string, workspaceId?: string) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      workspaceId: scopedWorkspaceId,
    },
    include: {
      client: true,
      workspace: true,
      builderWorkspace: true,
      createdBy: true,
      activeVersion: true,
      environments: {
        include: {
          domains: true,
          deployments: {
            orderBy: {
              requestedAt: "desc",
            },
            take: 10,
          },
        },
      },
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          deployments: true,
          createdBy: true,
        },
      },
      collaborators: {
        include: {
          workspace: true,
        },
      },
      transfers: {
        orderBy: {
          initiatedAt: "desc",
        },
        include: {
          fromWorkspace: true,
          toWorkspace: true,
          initiatedBy: true,
          acceptedBy: true,
        },
      },
    },
  });

  if (!site) {
    throw new Error("Site not found");
  }

  return site;
}

// Client actions
type CreateClientInput = {
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  metadata?: Json;
};

type UpdateClientInput = {
  name?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  metadata?: Json | null;
};

export async function getWorkspaceClients(workspaceId?: string) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  return prisma.client.findMany({
    where: { workspaceId: scopedWorkspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClientAction(
  input: CreateClientInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const name = input.name?.trim();
  if (!name) {
    throw new Error("Client name is required");
  }

  const client = await prisma.client.create({
    data: {
      name,
      contactName: input.contactName?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      metadata: optionalJson(input.metadata),
      workspaceId: scopedWorkspaceId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return client;
}

export async function updateClientAction(
  clientId: string,
  input: UpdateClientInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertClientOwnership(clientId, scopedWorkspaceId);

  const updateData: Prisma.ClientUpdateInput = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Client name cannot be empty");
    }
    updateData.name = name;
  }
  if (input.contactName !== undefined) {
    updateData.contactName = input.contactName?.trim() || null;
  }
  if (input.contactEmail !== undefined) {
    updateData.contactEmail = input.contactEmail?.trim() || null;
  }
  if (input.metadata !== undefined) {
    updateData.metadata = optionalJson(input.metadata);
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data: updateData,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return client;
}

export async function deleteClientAction(
  clientId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertClientOwnership(clientId, scopedWorkspaceId);

  await prisma.client.delete({
    where: { id: clientId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

// Site environment actions
type CreateSiteEnvironmentInput = {
  type: SiteEnvironmentType;
  name: string;
  vercelProjectId?: string | null;
  vercelTeamId?: string | null;
  vercelProjectName?: string | null;
  configuration?: Json | null;
};

type UpdateSiteEnvironmentInput = {
  name?: string;
  vercelProjectId?: string | null;
  vercelTeamId?: string | null;
  vercelProjectName?: string | null;
  configuration?: Json | null;
  lastSyncedAt?: Date | null;
};

export async function createSiteEnvironmentAction(
  siteId: string,
  input: CreateSiteEnvironmentInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const site = await assertSiteOwnership(siteId, scopedWorkspaceId);

  const existingEnvironment = await prisma.siteEnvironment.findFirst({
    where: {
      siteId: site.id,
      type: input.type,
    },
    select: { id: true },
  });

  if (existingEnvironment) {
    throw new Error("Environment of this type already exists for the site");
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error("Environment name is required");
  }

  const environment = await prisma.siteEnvironment.create({
    data: {
      siteId: site.id,
      type: input.type,
      name,
      vercelProjectId: input.vercelProjectId ?? null,
      vercelTeamId: input.vercelTeamId ?? null,
      vercelProjectName: input.vercelProjectName ?? null,
      configuration: optionalJson(input.configuration),
    },
  });

  revalidatePath("/dashboard/projects");

  return environment;
}

export async function updateSiteEnvironmentAction(
  environmentId: string,
  input: UpdateSiteEnvironmentInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const environment = await assertEnvironmentOwnership(
    environmentId,
    scopedWorkspaceId
  );

  const updateData: Prisma.SiteEnvironmentUpdateInput = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Environment name cannot be empty");
    }
    updateData.name = name;
  }
  if (input.vercelProjectId !== undefined) {
    updateData.vercelProjectId = input.vercelProjectId ?? null;
  }
  if (input.vercelTeamId !== undefined) {
    updateData.vercelTeamId = input.vercelTeamId ?? null;
  }
  if (input.vercelProjectName !== undefined) {
    updateData.vercelProjectName = input.vercelProjectName ?? null;
  }
  if (input.configuration !== undefined) {
    updateData.configuration = optionalJson(input.configuration);
  }
  if (input.lastSyncedAt !== undefined) {
    updateData.lastSyncedAt = input.lastSyncedAt ?? null;
  }

  const updated = await prisma.siteEnvironment.update({
    where: { id: environment.id },
    data: updateData,
  });

  revalidatePath("/dashboard/projects");

  return updated;
}

export async function deleteSiteEnvironmentAction(
  environmentId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertEnvironmentOwnership(environmentId, scopedWorkspaceId);

  await prisma.siteEnvironment.delete({
    where: { id: environmentId },
  });

  revalidatePath("/dashboard/projects");
}

// Domain actions
type AddSiteDomainInput = {
  domain: string;
  isPrimary?: boolean;
  status?: DomainStatus;
  vercelDomainId?: string | null;
  verificationToken?: string | null;
  dnsRecords?: Json | null;
  verifiedAt?: Date | null;
  lastCheckedAt?: Date | null;
};

type UpdateSiteDomainInput = {
  domain?: string;
  isPrimary?: boolean;
  status?: DomainStatus;
  vercelDomainId?: string | null;
  verificationToken?: string | null;
  dnsRecords?: Json | null;
  verifiedAt?: Date | null;
  lastCheckedAt?: Date | null;
};

export async function addSiteDomainAction(
  environmentId: string,
  input: AddSiteDomainInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const environment = await assertEnvironmentOwnership(
    environmentId,
    scopedWorkspaceId
  );

  const domainName = input.domain.trim().toLowerCase();
  if (!domainName) {
    throw new Error("Domain is required");
  }

  const result = await prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.siteDomain.updateMany({
        where: {
          environmentId: environment.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return tx.siteDomain.create({
      data: {
        environmentId: environment.id,
        domain: domainName,
        isPrimary: input.isPrimary ?? false,
        status: input.status ?? DomainStatus.PENDING_VERIFICATION,
        vercelDomainId: input.vercelDomainId ?? null,
        verificationToken: input.verificationToken ?? null,
        dnsRecords: optionalJson(input.dnsRecords),
        verifiedAt: input.verifiedAt ?? null,
        lastCheckedAt: input.lastCheckedAt ?? null,
        addedById: userId,
      },
    });
  });

  revalidatePath("/dashboard/projects");

  return result;
}

export async function updateSiteDomainAction(
  domainId: string,
  input: UpdateSiteDomainInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

  const updateData: Prisma.SiteDomainUpdateInput = {};
  if (input.domain !== undefined) {
    const domainName = input.domain.trim().toLowerCase();
    if (!domainName) {
      throw new Error("Domain cannot be empty");
    }
    updateData.domain = domainName;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
  }
  if (input.vercelDomainId !== undefined) {
    updateData.vercelDomainId = input.vercelDomainId ?? null;
  }
  if (input.verificationToken !== undefined) {
    updateData.verificationToken = input.verificationToken ?? null;
  }
  if (input.dnsRecords !== undefined) {
    updateData.dnsRecords = optionalJson(input.dnsRecords);
  }
  if (input.verifiedAt !== undefined) {
    updateData.verifiedAt = input.verifiedAt ?? null;
  }
  if (input.lastCheckedAt !== undefined) {
    updateData.lastCheckedAt = input.lastCheckedAt ?? null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.isPrimary === true) {
      await tx.siteDomain.updateMany({
        where: {
          environmentId: domain.environmentId,
          isPrimary: true,
          id: { not: domainId },
        },
        data: {
          isPrimary: false,
        },
      });
      updateData.isPrimary = true;
    } else if (input.isPrimary === false) {
      updateData.isPrimary = false;
    }

    return tx.siteDomain.update({
      where: { id: domainId },
      data: updateData,
    });
  });

  revalidatePath("/dashboard/projects");

  return updated;
}

export async function removeSiteDomainAction(
  domainId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertDomainOwnership(domainId, scopedWorkspaceId);

  await prisma.siteDomain.delete({
    where: { id: domainId },
  });

  revalidatePath("/dashboard/projects");
}

// Site version actions
type CreateSiteVersionInput = {
  label?: string | null;
  status?: SiteStatus;
  manifest?: Json | null;
  archiveStorageKey?: string | null;
  sandboxProvider?: SandboxProvider | null;
  sandboxId?: string | null;
  conversationState?: Json | null;
};

type UpdateSiteVersionInput = {
  label?: string | null;
  status?: SiteStatus;
  manifest?: Json | null;
  archiveStorageKey?: string | null;
  sandboxProvider?: SandboxProvider | null;
  sandboxId?: string | null;
  conversationState?: Json | null;
};

export async function createSiteVersionAction(
  siteId: string,
  input: CreateSiteVersionInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const site = await assertSiteOwnership(siteId, scopedWorkspaceId);

  const nextNumber = await prisma.siteVersion
    .findFirst({
      where: { siteId: site.id },
      select: { number: true },
      orderBy: { number: "desc" },
    })
    .then((latest) => (latest ? latest.number + 1 : 1));

  const version = await prisma.siteVersion.create({
    data: {
      siteId: site.id,
      number: nextNumber,
      label: input.label ?? null,
      status: input.status ?? SiteStatus.DRAFT,
      manifest: optionalJson(input.manifest),
      archiveStorageKey: input.archiveStorageKey ?? null,
      sandboxProvider: input.sandboxProvider ?? null,
      sandboxId: input.sandboxId ?? null,
      conversationState: optionalJson(input.conversationState),
      createdById: userId,
    },
    include: {
      deployments: true,
    },
  });

  revalidatePath("/dashboard/projects");

  return version;
}

export async function updateSiteVersionAction(
  versionId: string,
  input: UpdateSiteVersionInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertVersionOwnership(versionId, scopedWorkspaceId);

  const updateData: Prisma.SiteVersionUpdateInput = {};
  if (input.label !== undefined) {
    updateData.label = input.label ?? null;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
  }
  if (input.manifest !== undefined) {
    updateData.manifest = optionalJson(input.manifest);
  }
  if (input.archiveStorageKey !== undefined) {
    updateData.archiveStorageKey = input.archiveStorageKey ?? null;
  }
  if (input.sandboxProvider !== undefined) {
    updateData.sandboxProvider = input.sandboxProvider ?? null;
  }
  if (input.sandboxId !== undefined) {
    updateData.sandboxId = input.sandboxId ?? null;
  }
  if (input.conversationState !== undefined) {
    updateData.conversationState = optionalJson(input.conversationState);
  }

  const version = await prisma.siteVersion.update({
    where: { id: versionId },
    data: updateData,
    include: {
      deployments: true,
    },
  });

  revalidatePath("/dashboard/projects");

  return version;
}

export async function activateSiteVersionAction(
  siteId: string,
  versionId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const site = await assertSiteOwnership(siteId, scopedWorkspaceId);
  const version = await assertVersionOwnership(versionId, scopedWorkspaceId);

  if (version.siteId !== site.id) {
    throw new Error("Version does not belong to the site");
  }

  await prisma.site.update({
    where: { id: site.id },
    data: {
      activeVersionId: versionId,
      status:
        site.archivedAt != null ? SiteStatus.ARCHIVED : SiteStatus.LIVE,
    },
  });

  revalidatePath("/dashboard/projects");
}

export async function deleteSiteVersionAction(
  versionId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const version = await assertVersionOwnership(versionId, scopedWorkspaceId);
  if (version.site.activeVersionId === versionId) {
    throw new Error("Cannot delete the active version");
  }

  await prisma.siteVersion.delete({
    where: { id: versionId },
  });

  revalidatePath("/dashboard/projects");
}

// Deployment actions
type CreateSiteDeploymentInput = {
  versionId?: string | null;
  vercelDeploymentId: string;
  url: string;
  status?: DeploymentStatus;
  metadata?: Json | null;
};

type UpdateSiteDeploymentInput = {
  status?: DeploymentStatus;
  url?: string;
  metadata?: Json | null;
  completedAt?: Date | null;
};

export async function createSiteDeploymentAction(
  environmentId: string,
  input: CreateSiteDeploymentInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const environment = await assertEnvironmentOwnership(
    environmentId,
    scopedWorkspaceId
  );

  if (input.versionId) {
    const version = await assertVersionOwnership(
      input.versionId,
      scopedWorkspaceId
    );
    if (version.siteId !== environment.siteId) {
      throw new Error("Version does not belong to the environment's site");
    }
  }

  const deployment = await prisma.siteDeployment.create({
    data: {
      environmentId: environment.id,
      versionId: input.versionId ?? null,
      vercelDeploymentId: input.vercelDeploymentId,
      url: input.url,
      status: input.status ?? DeploymentStatus.QUEUED,
      metadata: optionalJson(input.metadata),
      triggeredById: userId,
    },
  });

  revalidatePath("/dashboard/projects");

  return deployment;
}

export async function updateSiteDeploymentAction(
  deploymentId: string,
  input: UpdateSiteDeploymentInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const ownedDeployment = await assertDeploymentOwnership(
    deploymentId,
    scopedWorkspaceId
  );

  const updateData: Prisma.SiteDeploymentUpdateInput = {};
  if (input.status !== undefined) {
    updateData.status = input.status;
  }
  if (input.url !== undefined) {
    updateData.url = input.url;
  }
  if (input.metadata !== undefined) {
    updateData.metadata = optionalJson(input.metadata);
  }
  if (input.completedAt !== undefined) {
    updateData.completedAt = input.completedAt ?? null;
  }

  const deployment = await prisma.siteDeployment.update({
    where: { id: deploymentId },
    data: updateData,
  });

  revalidatePath("/dashboard/projects");

  if (
    deployment.status === DeploymentStatus.FAILED &&
    canSendEmail() &&
    ownedDeployment.environment?.site
  ) {
    const appBaseUrl =
      (process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech").replace(
        /\/$/,
        ""
      );
    const siteName = ownedDeployment.environment.site.name;
    const environmentName = ownedDeployment.environment.name ?? "Production";
    const workspaceEmail =
      ownedDeployment.environment.site.workspace?.businessEmail?.trim();
    const triggeredByEmail = ownedDeployment.triggeredBy?.email?.trim();
    const recipients = Array.from(
      new Set(
        [workspaceEmail, triggeredByEmail].filter(
          (email): email is string => Boolean(email)
        )
      )
    );

    if (recipients.length > 0) {
      const failedAt = (input.completedAt ?? new Date()).toLocaleString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
      const retryUrl = `${appBaseUrl}/dashboard/projects/${ownedDeployment.environment.site.id}`;
      const logsUrl = deployment.url || ownedDeployment.url || undefined;
      const supportEmail =
        ownedDeployment.environment.site.workspace?.businessEmail?.trim() ||
        undefined;

      recipients.forEach((recipientEmail) => {
        sendEmail({
          to: recipientEmail,
          subject: `Deployment failed – ${siteName} (${environmentName})`,
          react: DeploymentFailedEmail({
            siteName,
            environmentName,
            failedAt,
            errorSummary:
              typeof input.metadata === "object" &&
              input.metadata !== null &&
              "error" in input.metadata &&
              typeof (input.metadata as Record<string, unknown>).error ===
                "string"
                ? (input.metadata as Record<string, string>).error
                : undefined,
            logsUrl,
            retryUrl,
            supportEmail,
          }),
        }).catch((error) =>
          console.error("Failed to send deployment failed email:", error)
        );
      });
    }
  }

  return deployment;
}


// Collaborator actions
type AddSiteCollaboratorInput = {
  collaboratorWorkspaceId: string;
  role?: SiteCollaboratorRole;
};

type UpdateSiteCollaboratorInput = {
  role: SiteCollaboratorRole;
};

export async function addSiteCollaboratorAction(
  siteId: string,
  input: AddSiteCollaboratorInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const site = await assertSiteOwnership(siteId, scopedWorkspaceId);

  const actingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
    },
  });

  if (site.workspaceId === input.collaboratorWorkspaceId) {
    throw new Error("Site already belongs to this workspace");
  }

  const collaboratorWorkspace = await prisma.workspace.findUnique({
    where: { id: input.collaboratorWorkspaceId },
    select: {
      id: true,
      name: true,
      businessName: true,
      businessEmail: true,
    },
  });

  if (!collaboratorWorkspace) {
    throw new Error("Collaborator workspace not found");
  }

  const collaborator = await prisma.siteCollaborator.upsert({
    where: {
      siteId_workspaceId: {
        siteId: site.id,
        workspaceId: input.collaboratorWorkspaceId,
      },
    },
    update: {
      role: input.role ?? SiteCollaboratorRole.EDITOR,
      invitedById: userId,
    },
    create: {
      siteId: site.id,
      workspaceId: input.collaboratorWorkspaceId,
      role: input.role ?? SiteCollaboratorRole.EDITOR,
      invitedById: userId,
    },
  });

  revalidatePath("/dashboard/projects");

  const collaboratorEmail =
    collaboratorWorkspace.businessEmail?.trim() || undefined;
  const appBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"
  ).replace(/\/$/, "");
  const dashboardUrl = `${appBaseUrl}/dashboard/projects/${site.id}`;
  const collaboratorRole = input.role ?? SiteCollaboratorRole.EDITOR;
  const roleLabel =
    collaboratorRole.charAt(0) + collaboratorRole.slice(1).toLowerCase();

  if (canSendEmail() && collaboratorEmail) {
    sendEmail({
      to: collaboratorEmail,
      subject: `You're now collaborating on ${site.name}`,
      react: SiteCollaboratorAddedEmail({
        collaboratorWorkspaceName:
          collaboratorWorkspace.businessName?.trim() ||
          collaboratorWorkspace.name,
        siteName: site.name,
        role: roleLabel,
        inviterName: actingUser?.name,
        dashboardUrl,
      }),
    }).catch((error) =>
      console.error("Failed to send site collaborator email:", error)
    );
  }

  return collaborator;
}

export async function updateSiteCollaboratorRoleAction(
  collaboratorId: string,
  input: UpdateSiteCollaboratorInput,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertCollaboratorOwnership(collaboratorId, scopedWorkspaceId);

  const collaborator = await prisma.siteCollaborator.update({
    where: { id: collaboratorId },
    data: {
      role: input.role,
    },
  });

  revalidatePath("/dashboard/projects");

  return collaborator;
}

export async function removeSiteCollaboratorAction(
  collaboratorId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  await assertCollaboratorOwnership(collaboratorId, scopedWorkspaceId);

  await prisma.siteCollaborator.delete({
    where: { id: collaboratorId },
  });

  revalidatePath("/dashboard/projects");
}

// Transfer actions
type InitiateSiteTransferInput = {
  toWorkspaceId: string;
  notes?: string | null;
};

export async function initiateSiteTransferAction(
  siteId: string,
  input: InitiateSiteTransferInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const site = await assertSiteOwnership(siteId, scopedWorkspaceId);

  if (site.workspaceId === input.toWorkspaceId) {
    throw new Error("Site already belongs to the target workspace");
  }

  const targetWorkspace = await prisma.workspace.findUnique({
    where: { id: input.toWorkspaceId },
    select: {
      id: true,
      name: true,
      businessName: true,
      businessEmail: true,
    },
  });

  if (!targetWorkspace) {
    throw new Error("Target workspace not found");
  }

  const sourceWorkspace = await prisma.workspace.findUnique({
    where: { id: scopedWorkspaceId },
    select: {
      name: true,
      businessName: true,
    },
  });

  const transfer = await prisma.siteTransfer.create({
    data: {
      siteId: site.id,
      fromWorkspaceId: scopedWorkspaceId,
      toWorkspaceId: input.toWorkspaceId,
      status: SiteTransferStatus.PENDING,
      initiatedById: userId,
      notes: input.notes ?? null,
    },
  });

  await prisma.site.update({
    where: { id: site.id },
    data: {
      status: SiteStatus.READY_FOR_TRANSFER,
    },
  });

  revalidatePath("/dashboard/projects");

  const targetEmail = targetWorkspace.businessEmail?.trim() || undefined;
  const appBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech").replace(
      /\/$/,
      ""
    );
  const reviewUrl = `${appBaseUrl}/dashboard/projects/${site.id}`;
  const fromWorkspaceName =
    sourceWorkspace?.businessName?.trim() ||
    sourceWorkspace?.name ||
    "Your workspace";
  const toWorkspaceName =
    targetWorkspace.businessName?.trim() || targetWorkspace.name;

  if (canSendEmail() && targetEmail) {
    const requestedAt = transfer.initiatedAt.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    sendEmail({
      to: targetEmail,
      subject: `Site transfer request: ${site.name}`,
      react: SiteTransferRequestEmail({
        siteName: site.name,
        fromWorkspaceName,
        toWorkspaceName,
        requestedAt,
        notes: input.notes,
        reviewUrl,
      }),
    }).catch((error) =>
      console.error("Failed to send site transfer request email:", error)
    );
  }

  return transfer;
}

type RespondSiteTransferInput = {
  action: "accept" | "decline";
  notes?: string | null;
};

export async function respondSiteTransferAction(
  transferId: string,
  input: RespondSiteTransferInput,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const actingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
    },
  });

  const transfer = await assertTransferOwnership(transferId, scopedWorkspaceId);

  if (transfer.status !== SiteTransferStatus.PENDING) {
    throw new Error("Transfer is no longer pending");
  }

  if (transfer.toWorkspaceId !== scopedWorkspaceId) {
    throw new Error("Only the target workspace can respond to the transfer");
  }

  const now = new Date();
  const appBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech").replace(
      /\/$/,
      ""
    );
  const siteName = transfer.site?.name || "the site";
  const dashboardUrl = `${appBaseUrl}/dashboard/projects/${
    transfer.site?.id || transfer.siteId
  }`;
  const fromEmail = transfer.fromWorkspace?.businessEmail?.trim();
  const toEmail = transfer.toWorkspace?.businessEmail?.trim();
  const recipients = Array.from(
    new Set(
      [fromEmail, toEmail].filter((email): email is string => Boolean(email))
    )
  );
  const actedByName = actingUser?.name;
  const notes = input.notes ?? transfer.notes;
  const actedAt = now.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  if (input.action === "accept") {
    await prisma.$transaction([
      prisma.siteTransfer.update({
        where: { id: transferId },
        data: {
          status: SiteTransferStatus.ACCEPTED,
          acceptedById: userId,
          completedAt: now,
          notes: input.notes ?? transfer.notes,
        },
      }),
      prisma.site.update({
        where: { id: transfer.siteId },
        data: {
          workspaceId: transfer.toWorkspaceId,
          status: SiteStatus.LIVE,
        },
      }),
    ]);

    if (canSendEmail() && recipients.length > 0) {
      recipients.forEach((recipientEmail) => {
        sendEmail({
          to: recipientEmail,
          subject: `Transfer accepted: ${siteName}`,
          react: SiteTransferStatusEmail({
            siteName,
            status: "accepted",
            actedByName,
            actedAt,
            notes,
            dashboardUrl,
          }),
        }).catch((error) =>
          console.error("Failed to send site transfer accepted email:", error)
        );
      });
    }
  } else {
    await prisma.siteTransfer.update({
      where: { id: transferId },
      data: {
        status: SiteTransferStatus.DECLINED,
        acceptedById: userId,
        completedAt: now,
        notes: input.notes ?? transfer.notes,
      },
    });

    if (canSendEmail() && recipients.length > 0) {
      recipients.forEach((recipientEmail) => {
        sendEmail({
          to: recipientEmail,
          subject: `Transfer declined: ${siteName}`,
          react: SiteTransferStatusEmail({
            siteName,
            status: "declined",
            actedByName,
            actedAt,
            notes,
            dashboardUrl,
          }),
        }).catch((error) =>
          console.error("Failed to send site transfer declined email:", error)
        );
      });
    }
  }

  revalidatePath("/dashboard/projects");

  return true;
}

export async function cancelSiteTransferAction(
  transferId: string,
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  const transfer = await assertTransferOwnership(transferId, scopedWorkspaceId);

  if (transfer.status !== SiteTransferStatus.PENDING) {
    throw new Error("Only pending transfers can be cancelled");
  }

  if (transfer.fromWorkspaceId !== scopedWorkspaceId) {
    throw new Error("Only the initiating workspace can cancel the transfer");
  }

  await prisma.siteTransfer.update({
    where: { id: transferId },
    data: {
      status: SiteTransferStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/dashboard/projects");

  const actingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
    },
  });

  if (canSendEmail()) {
    const fromEmail = transfer.fromWorkspace?.businessEmail?.trim();
    const toEmail = transfer.toWorkspace?.businessEmail?.trim();
    const recipients = Array.from(
      new Set(
        [fromEmail, toEmail].filter((email): email is string => Boolean(email))
      )
    );

    if (recipients.length > 0) {
      const appBaseUrl = (
        process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"
      ).replace(/\/$/, "");
      const siteName = transfer.site?.name || "the site";
      const dashboardUrl = `${appBaseUrl}/dashboard/projects/${
        transfer.site?.id || transfer.siteId
      }`;
      const actedAt = new Date().toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      recipients.forEach((recipientEmail) => {
        sendEmail({
          to: recipientEmail,
          subject: `Transfer cancelled: ${siteName}`,
          react: SiteTransferStatusEmail({
            siteName,
            status: "cancelled",
            actedByName: actingUser?.name,
            actedAt,
            notes: transfer.notes,
            dashboardUrl,
          }),
        }).catch((error) =>
          console.error("Failed to send site transfer cancelled email:", error)
        );
      });
    }
  }

  return true;
}
