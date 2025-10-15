"use server";

import prisma from "@/lib/prisma";
import { ProspectReviewStatus, SiteStatus, DomainStatus } from "@prisma/client";
import { addDomainToEnvironmentAction } from "./domain";
import { assignSubdomain } from "@/lib/subdomain/service";

/**
 * Submit prospect details after approval (second step)
 */
export async function submitProspectDetailsAction(input: {
  token: string;
  companyName: string;
  contactPhone?: string;
  customDomain?: string;
}) {
  const review = await prisma.prospectReview.findUnique({
    where: { shareToken: input.token },
    include: {
      site: {
        include: {
          environments: {
            where: { type: "PRODUCTION" },
          },
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.status !== ProspectReviewStatus.APPROVED) {
    throw new Error("Review must be approved first");
  }

  const now = new Date();
  const productionEnv = review.site.environments[0];

  if (!productionEnv) {
    throw new Error("No production environment found");
  }

  try {
    // Update review with details
    await prisma.prospectReview.update({
      where: { id: review.id },
      data: {
        status: ProspectReviewStatus.DETAILS_SUBMITTED,
        companyName: input.companyName.trim(),
        contactPhone: input.contactPhone?.trim() || null,
        requestedDomain: input.customDomain?.trim().toLowerCase() || null,
        detailsSubmittedAt: now,
      },
    });

    // Handle domain or subdomain assignment
    if (input.customDomain) {
      // Custom domain flow
      try {
        await addDomainToEnvironmentAction(
          productionEnv.id,
          input.customDomain,
          { isPrimary: true },
          review.site.workspaceId
        );

        // Update site status to awaiting DNS verification
        await prisma.site.update({
          where: { id: review.siteId },
          data: { status: SiteStatus.READY_FOR_TRANSFER },
        });

        return {
          success: true,
          type: "custom_domain" as const,
          domain: input.customDomain,
          nextStep: "dns_verification",
          message: `Domain ${input.customDomain} added. DNS verification required.`,
        };
      } catch (error) {
        throw new Error(
          `Failed to add custom domain: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } else {
      // Subdomain flow
      try {
        const { fullDomain } = await assignSubdomain(
          review.siteId,
          review.site.name
        );

        // Update review status to DEPLOYING
        await prisma.prospectReview.update({
          where: { id: review.id },
          data: { status: ProspectReviewStatus.DEPLOYING },
        });

        // Update site status to LIVE
        await prisma.site.update({
          where: { id: review.siteId },
          data: { status: SiteStatus.LIVE },
        });

        // TODO: Trigger actual Vercel deployment
        // For now, we'll mark it as deploying

        // Simulate deployment delay
        setTimeout(async () => {
          await prisma.prospectReview.update({
            where: { id: review.id },
            data: { status: ProspectReviewStatus.LIVE },
          });
        }, 5000);

        return {
          success: true,
          type: "subdomain" as const,
          domain: fullDomain,
          nextStep: "deployment",
          message: `Your site is being deployed to ${fullDomain}`,
        };
      } catch (error) {
        throw new Error(
          `Failed to assign subdomain: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  } catch (error) {
    console.error("Failed to submit prospect details:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to submit details"
    );
  }
}
