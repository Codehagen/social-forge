"use server";

import prisma from "@/lib/prisma";
import { ProspectReviewStatus, SiteStatus } from "@prisma/client";
import { addDomainToEnvironmentAction } from "./domain";
import { assignSubdomain } from "@/lib/subdomain/service";
import {
  canSendEmail,
  sendEmail,
  ProspectDetailsReceivedEmail,
  SiteLiveAnnouncementEmail,
} from "@/lib/email";

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
          workspace: {
            select: {
              name: true,
              businessName: true,
              businessEmail: true,
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

  if (review.status !== ProspectReviewStatus.APPROVED) {
    throw new Error("Review must be approved first");
  }

  const now = new Date();
  const productionEnv = review.site.environments[0];

  if (!productionEnv) {
    throw new Error("No production environment found");
  }

  const trimmedCompanyName = input.companyName.trim();
  const trimmedPhone = input.contactPhone?.trim() || null;
  const trimmedCustomDomain =
    input.customDomain?.trim().toLowerCase() || null;
  const workspaceDisplayName =
    review.site.workspace?.businessName?.trim() ||
    review.site.workspace?.name?.trim() ||
    "Social Forge";
  const workspaceSupportEmail =
    review.site.workspace?.businessEmail?.trim() || undefined;
  const recipients = Array.from(
    new Set(
      [
        workspaceSupportEmail,
        review.createdBy?.email?.trim(),
      ].filter((email): email is string => Boolean(email))
    )
  );
  const appBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech").replace(
      /\/$/,
      ""
    );
  const dashboardUrl = `${appBaseUrl}/dashboard/projects/${review.siteId}`;
  const formattedSubmittedAt = now.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  try {
    // Update review with details
    await prisma.prospectReview.update({
      where: { id: review.id },
      data: {
        status: ProspectReviewStatus.DETAILS_SUBMITTED,
        companyName: trimmedCompanyName,
        contactPhone: trimmedPhone,
        requestedDomain: trimmedCustomDomain,
        detailsSubmittedAt: now,
      },
    });

    if (canSendEmail() && recipients.length > 0) {
      recipients.forEach((recipientEmail) => {
        sendEmail({
          to: recipientEmail,
          subject: `Handoff details received for ${review.site.name}`,
          react: ProspectDetailsReceivedEmail({
            siteName: review.site.name,
            prospectName: review.prospectName,
            prospectEmail: review.prospectEmail,
            submittedAt: formattedSubmittedAt,
            companyName: trimmedCompanyName,
            contactPhone: trimmedPhone || undefined,
            requestedDomain: trimmedCustomDomain || undefined,
            dashboardUrl,
          }),
        }).catch((error) =>
          console.error(
            "Failed to send prospect details received notification:",
            error
          )
        );
      });
    }

    // Handle domain or subdomain assignment
    if (trimmedCustomDomain) {
      // Custom domain flow
      try {
        await addDomainToEnvironmentAction(
          productionEnv.id,
          trimmedCustomDomain,
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
          domain: trimmedCustomDomain,
          nextStep: "dns_verification",
          message: `Domain ${trimmedCustomDomain} added. DNS verification required.`,
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

          if (canSendEmail()) {
            sendEmail({
              to: review.prospectEmail,
              subject: `🚀 ${review.site.name} is live!`,
              react: SiteLiveAnnouncementEmail({
                prospectName: review.prospectName,
                siteName: review.site.name,
                liveDomain: fullDomain,
                workspaceName: workspaceDisplayName,
                supportEmail: workspaceSupportEmail,
              }),
            }).catch((error) =>
              console.error("Failed to send site live announcement:", error)
            );
          }
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
