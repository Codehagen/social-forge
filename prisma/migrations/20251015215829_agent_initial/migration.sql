-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('DRAFT', 'REVIEW', 'READY_FOR_TRANSFER', 'LIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SiteEnvironmentType" AS ENUM ('DEVELOPMENT', 'PREVIEW', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('QUEUED', 'BUILDING', 'READY', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgentTaskStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'AWAITING_MERGE');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('CLAUDE_CODE', 'OPENAI_CODEX', 'CURSOR_CLI', 'GEMINI_CLI', 'OPEN_CODE');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('PENDING', 'STARTING', 'STREAMING', 'COMPLETED', 'ERRORED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgentLogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- CreateEnum
CREATE TYPE "AgentArtifactType" AS ENUM ('DIFF', 'FILE', 'LOG', 'SCREENSHOT', 'OTHER');

-- CreateEnum
CREATE TYPE "RepositoryProvider" AS ENUM ('GITHUB', 'GITLAB', 'BITBUCKET');

-- CreateEnum
CREATE TYPE "AgentJobStatus" AS ENUM ('PENDING', 'CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFYING', 'ACTIVE', 'FAILED', 'REMOVED');

-- CreateEnum
CREATE TYPE "SiteTransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SiteCollaboratorRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "BuilderSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED', 'FAILED');

-- CreateEnum
CREATE TYPE "SandboxProvider" AS ENUM ('VERCEL', 'E2B', 'LOCAL');

-- CreateEnum
CREATE TYPE "ProspectReviewStatus" AS ENUM ('PENDING', 'VIEWED', 'APPROVED', 'DETAILS_SUBMITTED', 'DEPLOYING', 'LIVE', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "agent" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingData" JSONB,
    "defaultWorkspaceId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeWorkspaceId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "businessName" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_member" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "workspace_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,

    CONSTRAINT "workspace_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "builderWorkspaceId" TEXT,
    "clientId" TEXT,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL DEFAULT 'DRAFT',
    "brief" JSONB,
    "metadata" JSONB,
    "activeVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteEnvironment" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "type" "SiteEnvironmentType" NOT NULL,
    "name" TEXT NOT NULL,
    "vercelProjectId" TEXT,
    "vercelTeamId" TEXT,
    "vercelProjectName" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteDomain" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "vercelDomainId" TEXT,
    "vercelConfigurationId" TEXT,
    "verificationToken" TEXT,
    "verificationMethod" TEXT,
    "dnsRecords" JSONB,
    "verificationRecords" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteVersion" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT,
    "status" "SiteStatus" NOT NULL DEFAULT 'DRAFT',
    "manifest" JSONB,
    "archiveStorageKey" TEXT,
    "sandboxProvider" "SandboxProvider",
    "sandboxId" TEXT,
    "conversationState" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteDeployment" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "versionId" TEXT,
    "vercelDeploymentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'QUEUED',
    "triggeredById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "SiteDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuilderSession" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "BuilderSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" "SandboxProvider" NOT NULL,
    "sandboxId" TEXT,
    "initialVersionId" TEXT,
    "resultingVersionId" TEXT,
    "conversationState" JSONB,
    "promptSummary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "BuilderSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "siteId" TEXT,
    "createdById" TEXT NOT NULL,
    "repositoryId" TEXT,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "status" "AgentTaskStatus" NOT NULL DEFAULT 'QUEUED',
    "currentRunId" TEXT,
    "branchName" TEXT,
    "targetRef" TEXT,
    "baseSha" TEXT,
    "headSha" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sandboxId" TEXT,
    "sandboxProvider" "SandboxProvider",
    "status" "AgentRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "exitCode" INTEGER,
    "errorMessage" TEXT,
    "logSequence" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "runId" TEXT,
    "sequence" INTEGER NOT NULL,
    "level" "AgentLogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentArtifact" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "type" "AgentArtifactType" NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "diff" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceRepository" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "RepositoryProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL,
    "lastSyncedSha" TEXT,
    "installationId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceRepositoryCredential" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "userId" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceRepositoryCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "runId" TEXT,
    "status" "AgentJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "claimedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteCollaborator" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "SiteCollaboratorRole" NOT NULL DEFAULT 'EDITOR',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTransfer" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "fromWorkspaceId" TEXT NOT NULL,
    "toWorkspaceId" TEXT NOT NULL,
    "status" "SiteTransferStatus" NOT NULL DEFAULT 'PENDING',
    "initiatedById" TEXT NOT NULL,
    "acceptedById" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "SiteTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospect_review" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "prospectEmail" TEXT NOT NULL,
    "prospectName" TEXT,
    "shareToken" TEXT NOT NULL,
    "status" "ProspectReviewStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedDomain" TEXT,
    "companyName" TEXT,
    "contactPhone" TEXT,
    "additionalInfo" JSONB,
    "approvedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "detailsSubmittedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospect_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subdomain_assignment" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subdomain_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");

-- CreateIndex
CREATE INDEX "workspace_member_workspaceId_idx" ON "workspace_member"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_member_userId_idx" ON "workspace_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_member_userId_workspaceId_key" ON "workspace_member"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitation_token_key" ON "workspace_invitation"("token");

-- CreateIndex
CREATE INDEX "workspace_invitation_email_idx" ON "workspace_invitation"("email");

-- CreateIndex
CREATE INDEX "workspace_invitation_workspaceId_idx" ON "workspace_invitation"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Site_activeVersionId_key" ON "Site"("activeVersionId");

-- CreateIndex
CREATE INDEX "Site_workspaceId_idx" ON "Site"("workspaceId");

-- CreateIndex
CREATE INDEX "Site_builderWorkspaceId_idx" ON "Site"("builderWorkspaceId");

-- CreateIndex
CREATE INDEX "Site_clientId_idx" ON "Site"("clientId");

-- CreateIndex
CREATE INDEX "SiteEnvironment_siteId_idx" ON "SiteEnvironment"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteEnvironment_siteId_type_key" ON "SiteEnvironment"("siteId", "type");

-- CreateIndex
CREATE INDEX "SiteDomain_domain_idx" ON "SiteDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "SiteDomain_environmentId_domain_key" ON "SiteDomain"("environmentId", "domain");

-- CreateIndex
CREATE INDEX "SiteVersion_siteId_idx" ON "SiteVersion"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteVersion_siteId_number_key" ON "SiteVersion"("siteId", "number");

-- CreateIndex
CREATE INDEX "SiteDeployment_environmentId_idx" ON "SiteDeployment"("environmentId");

-- CreateIndex
CREATE INDEX "SiteDeployment_versionId_idx" ON "SiteDeployment"("versionId");

-- CreateIndex
CREATE INDEX "BuilderSession_workspaceId_idx" ON "BuilderSession"("workspaceId");

-- CreateIndex
CREATE INDEX "BuilderSession_siteId_idx" ON "BuilderSession"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTask_currentRunId_key" ON "AgentTask"("currentRunId");

-- CreateIndex
CREATE INDEX "AgentTask_workspaceId_idx" ON "AgentTask"("workspaceId");

-- CreateIndex
CREATE INDEX "AgentTask_siteId_idx" ON "AgentTask"("siteId");

-- CreateIndex
CREATE INDEX "AgentTask_repositoryId_idx" ON "AgentTask"("repositoryId");

-- CreateIndex
CREATE INDEX "AgentTask_status_idx" ON "AgentTask"("status");

-- CreateIndex
CREATE INDEX "AgentRun_taskId_idx" ON "AgentRun"("taskId");

-- CreateIndex
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");

-- CreateIndex
CREATE INDEX "AgentLog_taskId_sequence_idx" ON "AgentLog"("taskId", "sequence");

-- CreateIndex
CREATE INDEX "AgentLog_runId_sequence_idx" ON "AgentLog"("runId", "sequence");

-- CreateIndex
CREATE INDEX "AgentArtifact_taskId_idx" ON "AgentArtifact"("taskId");

-- CreateIndex
CREATE INDEX "WorkspaceRepository_workspaceId_isDefault_idx" ON "WorkspaceRepository"("workspaceId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRepository_workspaceId_provider_owner_name_key" ON "WorkspaceRepository"("workspaceId", "provider", "owner", "name");

-- CreateIndex
CREATE INDEX "WorkspaceRepositoryCredential_repositoryId_idx" ON "WorkspaceRepositoryCredential"("repositoryId");

-- CreateIndex
CREATE INDEX "WorkspaceRepositoryCredential_userId_idx" ON "WorkspaceRepositoryCredential"("userId");

-- CreateIndex
CREATE INDEX "AgentJob_workspaceId_idx" ON "AgentJob"("workspaceId");

-- CreateIndex
CREATE INDEX "AgentJob_taskId_idx" ON "AgentJob"("taskId");

-- CreateIndex
CREATE INDEX "AgentJob_status_idx" ON "AgentJob"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SiteCollaborator_siteId_workspaceId_key" ON "SiteCollaborator"("siteId", "workspaceId");

-- CreateIndex
CREATE INDEX "SiteTransfer_siteId_idx" ON "SiteTransfer"("siteId");

-- CreateIndex
CREATE INDEX "SiteTransfer_fromWorkspaceId_idx" ON "SiteTransfer"("fromWorkspaceId");

-- CreateIndex
CREATE INDEX "SiteTransfer_toWorkspaceId_idx" ON "SiteTransfer"("toWorkspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "prospect_review_shareToken_key" ON "prospect_review"("shareToken");

-- CreateIndex
CREATE INDEX "prospect_review_siteId_idx" ON "prospect_review"("siteId");

-- CreateIndex
CREATE INDEX "prospect_review_shareToken_idx" ON "prospect_review"("shareToken");

-- CreateIndex
CREATE INDEX "prospect_review_prospectEmail_idx" ON "prospect_review"("prospectEmail");

-- CreateIndex
CREATE UNIQUE INDEX "subdomain_assignment_siteId_key" ON "subdomain_assignment"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "subdomain_assignment_subdomain_key" ON "subdomain_assignment"("subdomain");

-- CreateIndex
CREATE INDEX "subdomain_assignment_subdomain_idx" ON "subdomain_assignment"("subdomain");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_defaultWorkspaceId_fkey" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_activeWorkspaceId_fkey" FOREIGN KEY ("activeWorkspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitation" ADD CONSTRAINT "workspace_invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitation" ADD CONSTRAINT "workspace_invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_builderWorkspaceId_fkey" FOREIGN KEY ("builderWorkspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "SiteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteEnvironment" ADD CONSTRAINT "SiteEnvironment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteDomain" ADD CONSTRAINT "SiteDomain_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "SiteEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteDomain" ADD CONSTRAINT "SiteDomain_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteVersion" ADD CONSTRAINT "SiteVersion_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteVersion" ADD CONSTRAINT "SiteVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteDeployment" ADD CONSTRAINT "SiteDeployment_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "SiteEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteDeployment" ADD CONSTRAINT "SiteDeployment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SiteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteDeployment" ADD CONSTRAINT "SiteDeployment_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderSession" ADD CONSTRAINT "BuilderSession_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderSession" ADD CONSTRAINT "BuilderSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderSession" ADD CONSTRAINT "BuilderSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderSession" ADD CONSTRAINT "BuilderSession_initialVersionId_fkey" FOREIGN KEY ("initialVersionId") REFERENCES "SiteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderSession" ADD CONSTRAINT "BuilderSession_resultingVersionId_fkey" FOREIGN KEY ("resultingVersionId") REFERENCES "SiteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "WorkspaceRepository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_currentRunId_fkey" FOREIGN KEY ("currentRunId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentArtifact" ADD CONSTRAINT "AgentArtifact_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRepository" ADD CONSTRAINT "WorkspaceRepository_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRepository" ADD CONSTRAINT "WorkspaceRepository_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRepositoryCredential" ADD CONSTRAINT "WorkspaceRepositoryCredential_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "WorkspaceRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRepositoryCredential" ADD CONSTRAINT "WorkspaceRepositoryCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteCollaborator" ADD CONSTRAINT "SiteCollaborator_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteCollaborator" ADD CONSTRAINT "SiteCollaborator_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteCollaborator" ADD CONSTRAINT "SiteCollaborator_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTransfer" ADD CONSTRAINT "SiteTransfer_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTransfer" ADD CONSTRAINT "SiteTransfer_fromWorkspaceId_fkey" FOREIGN KEY ("fromWorkspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTransfer" ADD CONSTRAINT "SiteTransfer_toWorkspaceId_fkey" FOREIGN KEY ("toWorkspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTransfer" ADD CONSTRAINT "SiteTransfer_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTransfer" ADD CONSTRAINT "SiteTransfer_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_review" ADD CONSTRAINT "prospect_review_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_review" ADD CONSTRAINT "prospect_review_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subdomain_assignment" ADD CONSTRAINT "subdomain_assignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
