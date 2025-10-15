import { notFound } from "next/navigation";
import { getProspectReviewByTokenAction } from "@/app/actions/prospect";
import { ProspectApprovalForm } from "@/components/prospects/ProspectApprovalForm";
import { ProspectDetailsForm } from "@/components/prospects/ProspectDetailsForm";
import { DeploymentStatus } from "@/components/prospects/DeploymentStatus";
import { ProspectApprovalHeader } from "@/components/prospects/ProspectApprovalHeader";
import { ProspectInfoCards } from "@/components/prospects/ProspectInfoCards";
import { IconCheck, IconClock, IconX } from "@tabler/icons-react";

type PageProps = {
  params: Promise<{ token: string }> | { token: string };
};

export default async function PreviewPage({ params }: PageProps) {
  const { token } = await Promise.resolve(params);

  try {
    const review = await getProspectReviewByTokenAction(token);

    // Find the preview URL
    const previewEnvironment = review.site.environments.find(
      (env) => env.type === "PREVIEW"
    );
    const previewDeployment = previewEnvironment?.deployments[0];
    const previewUrl = previewDeployment?.url || review.site.activeVersion?.sandboxId;

    const isCompleted =
      review.status === "DECLINED" ||
      review.status === "LIVE";
    const needsDetails = review.status === "APPROVED";
    const isDeploying = review.status === "DEPLOYING";
    const isAwaitingDetails = review.status === "DETAILS_SUBMITTED";

    return (
      <div className="space-y-8">
        {/* Header */}
        <ProspectApprovalHeader
            siteName={review.site.name}
            prospectName={review.prospectName}
            status={review.status}
            message={review.message}
            workspace={review.site.workspace}
          />

          {/* Info Cards */}
          <ProspectInfoCards
            prospectEmail={review.prospectEmail}
            prospectName={review.prospectName}
            companyName={review.companyName}
            contactPhone={review.contactPhone}
            createdAt={review.createdAt}
            workspace={review.site.workspace}
          />

          {/* Feedback/Completion Messages */}
          {review.status === "LIVE" && (
            <div className="ring-green-500/20 bg-green-50 rounded-2xl border-green-200 p-6 shadow-sm ring-1">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-500/10 p-2">
                  <IconCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-600">
                    Website is Live!
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your website has been successfully deployed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {review.status === "DECLINED" && (
            <div className="ring-red-500/20 bg-red-50 rounded-2xl border-red-200 p-6 shadow-sm ring-1">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-500/10 p-2">
                  <IconX className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-600">
                    Review Declined
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This website was not approved.
                  </p>
                  {review.feedback && (
                    <p className="mt-2 text-sm italic text-muted-foreground">
                      Feedback: "{review.feedback}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAwaitingDetails && (
            <div className="ring-blue-500/20 bg-blue-50 rounded-2xl border-blue-200 p-6 shadow-sm ring-1">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <IconClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600">
                    Processing Your Request
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We're setting up your website. This will be ready shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Preview Panel */}
            <div className="lg:col-span-2 ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    This is how your website will look to visitors
                  </p>
                </div>
                {previewUrl ? (
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border bg-white">
                    <iframe
                      src={previewUrl}
                      className="h-full w-full"
                      title="Website Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-lg border bg-muted">
                    <p className="text-sm text-muted-foreground">
                      Preview not available yet
                    </p>
                  </div>
                )}
                {previewUrl && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>View in new tab:</span>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {previewUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Right Panel */}
            {review.status === "PENDING" || review.status === "VIEWED" ? (
              <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Your Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      Let us know if you're ready to proceed
                    </p>
                  </div>
                  <ProspectApprovalForm
                    token={token}
                    siteName={review.site.name}
                  />
                </div>
              </div>
            ) : needsDetails ? (
              <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Final Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Just a few more details to get you live
                    </p>
                  </div>
                  <ProspectDetailsForm
                    token={token}
                    siteName={review.site.name}
                    prospectEmail={review.prospectEmail}
                    prospectName={review.prospectName}
                  />
                </div>
              </div>
            ) : isDeploying ? (
              <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Deployment in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Your website is being deployed
                    </p>
                  </div>
                  <DeploymentStatus
                    status="deploying"
                    domain={review.requestedDomain || "your-site.socialforge.tech"}
                  />
                </div>
              </div>
            ) : review.status === "LIVE" ? (
              <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Success!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your website is now live
                    </p>
                  </div>
                  <DeploymentStatus
                    status="live"
                    domain={review.requestedDomain || "your-site.socialforge.tech"}
                  />
                </div>
              </div>
            ) : (
              <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Review Complete</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted on{" "}
                      {new Date(
                        review.approvedAt || review.declinedAt || review.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your feedback. You can close this page.
                  </p>
                </div>
              </div>
            )}
          </div>

        {/* Expiration Notice */}
        {review.expiresAt && !isCompleted && !needsDetails && !isDeploying && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <IconClock className="inline-block h-4 w-4" /> This review link
            expires on {new Date(review.expiresAt).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Preview error:", error);
    notFound();
  }
}