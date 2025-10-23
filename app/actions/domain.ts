"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { DomainStatus } from "@prisma/client";
import {
  addDomainToProject,
  checkDomainVerification,
  getDomainVerificationRecords,
  removeDomain,
  verifyDomain,
} from "@/lib/vercel/domain-service";
import {
  canSendEmail,
  sendEmail,
  DomainVerificationInstructionsEmail,
  DomainVerificationFailedEmail,
} from "@/lib/email";

type WorkspaceContext = {
  userId: string;
  workspaceId: string;
};

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
    include: {
      environment: {
        select: {
          siteId: true,
          vercelProjectId: true,
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
    },
  });

  if (!domain) {
    throw new Error("Domain not found");
  }

  return domain;
}

function getVercelCredentials() {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    throw new Error("VERCEL_TOKEN not configured");
  }

  return { token, teamId };
}

/**
 * Add a domain to a site environment and initiate Vercel setup
 */
export async function addDomainToEnvironmentAction(
  environmentId: string,
  domainName: string,
  options?: {
    isPrimary?: boolean;
    gitBranch?: string;
  },
  workspaceId?: string
) {
  const { userId, workspaceId: scopedWorkspaceId } =
    await resolveWorkspaceContext(workspaceId);

  // Verify environment ownership
  const environment = await prisma.siteEnvironment.findFirst({
    where: {
      id: environmentId,
      site: { workspaceId: scopedWorkspaceId },
    },
    include: {
      site: {
        include: {
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
  });

  if (!environment) {
    throw new Error("Environment not found");
  }

  const actingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
    },
  });

  // Validate domain format
  const cleanDomain = domainName.trim().toLowerCase();
  if (!cleanDomain || !/^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/.test(cleanDomain)) {
    throw new Error("Invalid domain format");
  }

  try {
    const credentials = getVercelCredentials();

    // Determine project ID (use configured or fallback)
    const vercelProjectId =
      environment.vercelProjectId ?? process.env.VERCEL_PROJECT_ID;

    if (!vercelProjectId) {
      throw new Error(
        "No Vercel project configured for this environment. Please set up Vercel project first."
      );
    }

    // Add domain to Vercel
    const vercelDomain = await addDomainToProject(
      vercelProjectId,
      {
        name: cleanDomain,
        gitBranch: options?.gitBranch,
      },
      credentials
    );

    // Get verification records
    const verificationResult = await getDomainVerificationRecords(
      vercelProjectId,
      cleanDomain,
      credentials
    );

    // Create domain in database
    const result = await prisma.$transaction(async (tx) => {
      if (options?.isPrimary) {
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
          domain: cleanDomain,
          isPrimary: options?.isPrimary ?? false,
          status: vercelDomain.verified
            ? DomainStatus.ACTIVE
            : DomainStatus.PENDING_VERIFICATION,
          vercelDomainId: vercelDomain.name,
          verificationMethod: vercelDomain.verification?.[0]?.type,
          dnsRecords: verificationResult.dnsRecords as never,
          verificationRecords: verificationResult.verificationRecords as never,
          verifiedAt: vercelDomain.verified ? new Date() : null,
          addedById: userId,
        },
      });
    });

    revalidatePath("/dashboard/projects");

    const workspaceEmail = environment.site.workspace?.businessEmail?.trim();
    const actingEmail = actingUser?.email?.trim();
    const recipients = Array.from(
      new Set(
        [workspaceEmail, actingEmail].filter(
          (email): email is string => Boolean(email)
        )
      )
    );

    if (!vercelDomain.verified && canSendEmail() && recipients.length > 0) {
      const appBaseUrl = (
        process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"
      ).replace(/\/$/, "");
      const verifyUrl = `${appBaseUrl}/dashboard/projects/${environment.siteId}`;

      recipients.forEach((recipientEmail) => {
        sendEmail({
          to: recipientEmail,
          subject: `Connect your domain: ${cleanDomain}`,
          react: DomainVerificationInstructionsEmail({
            domain: cleanDomain,
            projectName: environment.site.name,
            verificationRecords: verificationResult.verificationRecords,
            routingRecords: verificationResult.dnsRecords,
            verifyUrl,
          }),
        }).catch((error) =>
          console.error("Failed to send domain verification instructions:", error)
        );
      });
    }

    return {
      domain: result,
      verificationNeeded: !vercelDomain.verified,
      dnsRecords: verificationResult.dnsRecords,
      verificationRecords: verificationResult.verificationRecords,
    };
  } catch (error) {
    console.error("Failed to add domain:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to add domain to Vercel"
    );
  }
}

/**
 * Verify domain DNS configuration
 */
export async function verifyDomainAction(
  domainId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

  if (!domain.environment.vercelProjectId) {
    throw new Error("No Vercel project configured");
  }

  try {
    const credentials = getVercelCredentials();

    // Trigger verification on Vercel
    await verifyDomain(
      domain.environment.vercelProjectId,
      domain.domain,
      credentials
    );

    // Check verification status
    const verificationStatus = await checkDomainVerification(
      domain.environment.vercelProjectId,
      domain.domain,
      credentials
    );

    // Update domain status
    const updated = await prisma.siteDomain.update({
      where: { id: domainId },
      data: {
        status: verificationStatus.verified
          ? DomainStatus.ACTIVE
          : verificationStatus.misconfigured
          ? DomainStatus.FAILED
          : DomainStatus.VERIFYING,
        verifiedAt: verificationStatus.verified ? new Date() : null,
        failedAt:
          verificationStatus.misconfigured ||
          (!verificationStatus.verified && domain.status === DomainStatus.VERIFYING)
            ? new Date()
            : null,
        errorMessage: verificationStatus.error,
        lastCheckedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/projects");

    if (updated.status === DomainStatus.FAILED && canSendEmail()) {
      const workspaceEmail =
        domain.environment.site.workspace?.businessEmail?.trim();
      if (workspaceEmail) {
        const appBaseUrl = (
          process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"
        ).replace(/\/$/, "");
        const dnsRecordsUrl = `${appBaseUrl}/dashboard/projects/${domain.environment.siteId}`;
        const lastCheckedAt = updated.lastCheckedAt?.toLocaleString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }) ?? new Date().toLocaleString('en-US');

        sendEmail({
          to: workspaceEmail,
          subject: `Action needed: Fix DNS for ${domain.domain}`,
          react: DomainVerificationFailedEmail({
            domain: domain.domain,
            projectName: domain.environment.site.name,
            errorMessage: verificationStatus.error,
            lastCheckedAt,
            dnsRecordsUrl,
            supportEmail: workspaceEmail,
          }),
        }).catch((error) =>
          console.error("Failed to send domain verification failure email:", error)
        );
      }
    }

    return {
      verified: verificationStatus.verified,
      status: updated.status,
      error: verificationStatus.error,
    };
  } catch (error) {
    // Update domain to failed state
    await prisma.siteDomain.update({
      where: { id: domainId },
      data: {
        status: DomainStatus.FAILED,
        failedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Verification failed",
        lastCheckedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/projects");

    if (canSendEmail()) {
      const workspaceEmail =
        domain.environment.site.workspace?.businessEmail?.trim();
      if (workspaceEmail) {
        const appBaseUrl = (
          process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"
        ).replace(/\/$/, "");
        const dnsRecordsUrl = `${appBaseUrl}/dashboard/projects/${domain.environment.siteId}`;
        const lastCheckedAt = new Date().toLocaleString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        sendEmail({
          to: workspaceEmail,
          subject: `Action needed: Fix DNS for ${domain.domain}`,
          react: DomainVerificationFailedEmail({
            domain: domain.domain,
            projectName: domain.environment.site.name,
            errorMessage:
              error instanceof Error ? error.message : "Verification failed",
            lastCheckedAt,
            dnsRecordsUrl,
            supportEmail: workspaceEmail,
          }),
        }).catch((sendError) =>
          console.error(
            "Failed to send domain verification failure email (catch):",
            sendError
          )
        );
      }
    }

    throw new Error(
      error instanceof Error ? error.message : "Domain verification failed"
    );
  }
}

/**
 * Refresh domain verification status from Vercel
 */
export async function refreshDomainStatusAction(
  domainId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

  if (!domain.environment.vercelProjectId) {
    throw new Error("No Vercel project configured");
  }

  try {
    const credentials = getVercelCredentials();

    // Get updated verification records
    const verificationResult = await getDomainVerificationRecords(
      domain.environment.vercelProjectId,
      domain.domain,
      credentials
    );

    // Update domain with latest info
    await prisma.siteDomain.update({
      where: { id: domainId },
      data: {
        status: verificationResult.verified
          ? DomainStatus.ACTIVE
          : DomainStatus.PENDING_VERIFICATION,
        dnsRecords: verificationResult.dnsRecords as never,
        verificationRecords: verificationResult.verificationRecords as never,
        verifiedAt: verificationResult.verified ? new Date() : null,
        lastCheckedAt: new Date(),
        errorMessage: verificationResult.error,
      },
    });

    revalidatePath("/dashboard/projects");

    return {
      verified: verificationResult.verified,
      dnsRecords: verificationResult.dnsRecords,
      verificationRecords: verificationResult.verificationRecords,
      error: verificationResult.error,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to refresh domain status"
    );
  }
}

/**
 * Remove domain from Vercel and database
 */
export async function removeDomainAction(
  domainId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

  try {
    // Remove from Vercel if configured
    if (domain.environment.vercelProjectId) {
      const credentials = getVercelCredentials();
      await removeDomain(
        domain.environment.vercelProjectId,
        domain.domain,
        credentials
      );
    }

    // Remove from database
    await prisma.siteDomain.delete({
      where: { id: domainId },
    });

    revalidatePath("/dashboard/projects");

    return { success: true };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to remove domain"
    );
  }
}

/**
 * Get DNS records for a domain
 */
export async function getDomainDnsRecordsAction(
  domainId: string,
  workspaceId?: string
) {
  const { workspaceId: scopedWorkspaceId } = await resolveWorkspaceContext(
    workspaceId
  );

  const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

  return {
    domain: domain.domain,
    status: domain.status,
    dnsRecords: domain.dnsRecords,
    verificationRecords: domain.verificationRecords,
    verified: domain.status === DomainStatus.ACTIVE,
  };
}
