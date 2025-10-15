import prisma from "@/lib/prisma";
import { ProspectReviewStatus, SiteStatus, DomainStatus } from "@prisma/client";
import { addDomainToEnvironmentAction } from "@/app/actions/domain";

/**
 * Handle prospect approval workflow
 * This function should be called when a prospect approves a review
 */
export async function handleProspectApproval(reviewId: string) {
  const review = await prisma.prospectReview.findUnique({
    where: { id: reviewId },
    include: {
      site: {
        include: {
          environments: {
            where: { type: "PRODUCTION" },
          },
          workspace: true,
        },
      },
    },
  });

  if (!review || review.status !== ProspectReviewStatus.APPROVED) {
    throw new Error("Invalid or unapproved review");
  }

  const productionEnv = review.site.environments[0];
  if (!productionEnv) {
    throw new Error("No production environment found");
  }

  // If prospect provided a domain, add it and update site status
  if (review.requestedDomain) {
    try {
      // Add domain to production environment
      await addDomainToEnvironmentAction(
        productionEnv.id,
        review.requestedDomain,
        { isPrimary: true },
        review.site.workspaceId
      );

      // Update site status to indicate awaiting DNS
      await prisma.site.update({
        where: { id: review.siteId },
        data: { status: SiteStatus.READY_FOR_TRANSFER },
      });

      return {
        success: true,
        nextStep: "domain_verification" as const,
        domain: review.requestedDomain,
        message: `Domain ${review.requestedDomain} has been added. DNS verification required.`,
      };
    } catch (error) {
      console.error("Failed to add domain:", error);
      throw new Error(
        `Failed to add domain: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } else {
    // No domain provided, update status to LIVE
    await prisma.site.update({
      where: { id: review.siteId },
      data: { status: SiteStatus.LIVE },
    });

    return {
      success: true,
      nextStep: "deploy_to_vercel_subdomain" as const,
      message: "Site approved. Ready for deployment to Vercel subdomain.",
    };
  }
}

/**
 * Handle domain verification completion
 * This should be called when a domain is successfully verified
 */
export async function handleDomainVerified(domainId: string) {
  const domain = await prisma.siteDomain.findUnique({
    where: { id: domainId },
    include: {
      environment: {
        include: {
          site: {
            include: {
              activeVersion: true,
            },
          },
        },
      },
    },
  });

  if (!domain || domain.status !== DomainStatus.ACTIVE) {
    throw new Error("Domain not found or not verified");
  }

  const site = domain.environment.site;

  // Update site status to LIVE if it's not already
  if (site.status !== SiteStatus.LIVE) {
    await prisma.site.update({
      where: { id: site.id },
      data: { status: SiteStatus.LIVE },
    });
  }

  // TODO: Trigger actual Vercel deployment
  // This would involve:
  // 1. Getting the site version code
  // 2. Deploying to Vercel project
  // 3. Assigning the verified domain to the deployment
  // 4. Creating a SiteDeployment record

  return {
    success: true,
    message: `Domain ${domain.domain} verified. Site is now live.`,
    siteId: site.id,
    domainId: domain.id,
  };
}

/**
 * Check pending domains and attempt verification
 * This can be run as a cron job to automatically verify domains
 */
export async function checkPendingDomains() {
  const pendingDomains = await prisma.siteDomain.findMany({
    where: {
      status: {
        in: [DomainStatus.PENDING_VERIFICATION, DomainStatus.VERIFYING],
      },
      // Only check domains that haven't been checked in the last hour
      lastCheckedAt: {
        lt: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
    include: {
      environment: {
        select: {
          vercelProjectId: true,
          site: {
            select: {
              id: true,
              workspaceId: true,
            },
          },
        },
      },
    },
  });

  const results = [];

  for (const domain of pendingDomains) {
    try {
      // Import dynamically to avoid circular dependencies
      const { verifyDomainAction } = await import("@/app/actions/domain");

      const result = await verifyDomainAction(
        domain.id,
        domain.environment.site.workspaceId
      );

      results.push({
        domainId: domain.id,
        domain: domain.domain,
        verified: result.verified,
        status: result.status,
      });

      // If verified, trigger post-verification workflow
      if (result.verified) {
        await handleDomainVerified(domain.id);
      }
    } catch (error) {
      console.error(`Failed to verify domain ${domain.domain}:`, error);
      results.push({
        domainId: domain.id,
        domain: domain.domain,
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    checked: results.length,
    verified: results.filter((r) => r.verified).length,
    failed: results.filter((r) => !r.verified).length,
    results,
  };
}

/**
 * Send notification when prospect responds
 * This would integrate with your email service (Resend, etc.)
 */
export async function notifyProspectResponse(reviewId: string) {
  const review = await prisma.prospectReview.findUnique({
    where: { id: reviewId },
    include: {
      site: {
        select: {
          name: true,
          workspace: {
            select: {
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // TODO: Implement email notification
  // This would send an email to the review creator notifying them of the response
  // For now, we'll just log it

  console.log("Prospect response notification:", {
    reviewId: review.id,
    siteName: review.site.name,
    prospectEmail: review.prospectEmail,
    status: review.status,
    creatorEmail: review.createdBy?.email,
    requestedDomain: review.requestedDomain,
    feedback: review.feedback,
  });

  return {
    success: true,
    message: "Notification logged (email integration pending)",
  };
}
