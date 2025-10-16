"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconX,
  IconExternalLink,
  IconRocket,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";
import {
  getLatestActiveReview,
  getProspectTimeDescription,
  type ProspectReview,
} from "@/lib/prospect-helpers";

interface ProspectStatusBannerProps {
  reviews: ProspectReview[];
  siteId: string;
  siteName: string;
}

export function ProspectStatusBanner({
  reviews,
  siteId,
  siteName,
}: ProspectStatusBannerProps) {
  const latestReview = getLatestActiveReview(reviews);

  // Only show banner for significant states
  if (!latestReview) return null;

  const { status, prospectName, prospectEmail, requestedDomain, feedback } =
    latestReview;

  const prospectDisplayName = prospectName || prospectEmail;
  const timeDescription = getProspectTimeDescription(latestReview);

  // Render based on status
  switch (status) {
    case "APPROVED":
      return (
        <Alert className="border-green-500/50 bg-green-500/10">
          <IconCheck className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            Great news! {prospectDisplayName} approved the site
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between gap-4">
              <span>
                {timeDescription}
                {!requestedDomain &&
                  " • Next step: Collect domain and deployment details"}
              </span>
              {!requestedDomain && (
                <Button size="sm" variant="outline" className="shrink-0">
                  <IconFileText className="mr-2 h-3 w-3" />
                  Collect Details
                </Button>
              )}
            </div>
            {feedback && (
              <p className="mt-2 italic text-sm border-l-2 border-green-500 pl-3">
                "{feedback}"
              </p>
            )}
          </AlertDescription>
        </Alert>
      );

    case "DECLINED":
      return (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <IconX className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">
            {prospectDisplayName} declined the site
          </AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="flex items-center justify-between gap-4">
              <span>
                {timeDescription} • Consider their feedback and send a revised
                version
              </span>
            </div>
            {feedback && (
              <p className="mt-2 italic text-sm border-l-2 border-orange-500 pl-3">
                "{feedback}"
              </p>
            )}
          </AlertDescription>
        </Alert>
      );

    case "DETAILS_SUBMITTED":
      return (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <IconRocket className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            Ready to deploy!
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between gap-4">
              <span>
                {prospectDisplayName} provided deployment details
                {requestedDomain && ` for ${requestedDomain}`}
              </span>
              <Button size="sm" variant="outline" className="shrink-0">
                <IconRocket className="mr-2 h-3 w-3" />
                Deploy Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );

    case "DEPLOYING":
      return (
        <Alert className="border-purple-500/50 bg-purple-500/10">
          <IconSparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <AlertTitle className="text-purple-900 dark:text-purple-100">
            Deployment in progress...
          </AlertTitle>
          <AlertDescription className="text-purple-800 dark:text-purple-200">
            Your site is being deployed to{" "}
            {requestedDomain || "production"}. This usually takes 2-5 minutes.
          </AlertDescription>
        </Alert>
      );

    case "LIVE":
      return (
        <Alert className="border-green-500/50 bg-green-500/10">
          <IconCheck className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            Site is live! 🎉
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between gap-4">
              <span>
                {siteName} is now accessible at{" "}
                {requestedDomain || "your domain"}
              </span>
              {requestedDomain && (
                <Button size="sm" variant="outline" className="shrink-0" asChild>
                  <a
                    href={`https://${requestedDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="mr-2 h-3 w-3" />
                    Visit Site
                  </a>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );

    default:
      return null;
  }
}
