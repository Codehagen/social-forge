import { notFound } from "next/navigation";
import { getProspectReviewByTokenAction } from "@/app/actions/prospect";
import { ProspectApprovalForm } from "@/components/prospects/ProspectApprovalForm";
import { ProspectDetailsForm } from "@/components/prospects/ProspectDetailsForm";
import { DeploymentStatus } from "@/components/prospects/DeploymentStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl p-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Website Preview
            </h1>
            <p className="mt-2 text-muted-foreground">
              Review your custom website and provide feedback
            </p>
          </div>

          {/* Site Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{review.site.name}</CardTitle>
                  <CardDescription>
                    Shared with {review.prospectEmail}
                  </CardDescription>
                </div>
                <StatusBadge status={review.status} />
              </div>
            </CardHeader>
            {review.message && (
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.message}
                </p>
              </CardContent>
            )}
          </Card>

          {/* Feedback/Completion Messages */}
          {review.status === "LIVE" && (
            <Card className="mb-6 border-green-200">
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          )}

          {review.status === "DECLINED" && (
            <Card className="mb-6 border-red-200">
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          )}

          {isAwaitingDetails && (
            <Card className="mb-6 border-blue-200">
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Preview Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  This is how your website will look to visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Dynamic Right Panel */}
            {review.status === "PENDING" || review.status === "VIEWED" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Feedback</CardTitle>
                  <CardDescription>
                    Let us know if you're ready to proceed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProspectApprovalForm
                    token={token}
                    siteName={review.site.name}
                  />
                </CardContent>
              </Card>
            ) : needsDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle>Final Details</CardTitle>
                  <CardDescription>
                    Just a few more details to get you live
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProspectDetailsForm
                    token={token}
                    siteName={review.site.name}
                    prospectEmail={review.prospectEmail}
                    prospectName={review.prospectName}
                  />
                </CardContent>
              </Card>
            ) : isDeploying ? (
              <Card>
                <CardHeader>
                  <CardTitle>Deployment in Progress</CardTitle>
                  <CardDescription>
                    Your website is being deployed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeploymentStatus
                    status="deploying"
                    domain={review.requestedDomain || "your-site.socialforge.tech"}
                  />
                </CardContent>
              </Card>
            ) : review.status === "LIVE" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Success!</CardTitle>
                  <CardDescription>
                    Your website is now live
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeploymentStatus
                    status="live"
                    domain={review.requestedDomain || "your-site.socialforge.tech"}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Review Complete</CardTitle>
                  <CardDescription>
                    Submitted on{" "}
                    {new Date(
                      review.approvedAt || review.declinedAt || review.createdAt
                    ).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your feedback. You can close this page.
                  </p>
                </CardContent>
              </Card>
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
      </div>
    );
  } catch (error) {
    console.error("Preview error:", error);
    notFound();
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
          <IconCheck className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="destructive">
          <IconX className="mr-1 h-3 w-3" />
          Declined
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge variant="secondary">
          Viewed
        </Badge>
      );
    case "EXPIRED":
      return <Badge variant="outline">Expired</Badge>;
    default:
      return (
        <Badge variant="outline">
          <IconClock className="mr-1 h-3 w-3" />
          Pending Review
        </Badge>
      );
  }
}
