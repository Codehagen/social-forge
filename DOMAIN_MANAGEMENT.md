# Domain Management & Prospect Approval System

This document describes the domain management and prospect approval workflow implementation.

## Overview

The system enables you to:
1. **Send AI-generated websites to prospects for approval**
2. **Collect custom domain information from prospects**
3. **Guide prospects through DNS verification (Resend-style)**
4. **Automatically deploy to Vercel once approved**

## Architecture

### Database Models

#### ProspectReview
Tracks prospect review invitations and responses:
- `shareToken`: Unique public link for prospect access
- `status`: PENDING → VIEWED → APPROVED/DECLINED/EXPIRED
- `requestedDomain`: Optional domain provided by prospect
- `feedback`: Prospect's comments
- `expiresAt`: Review expiration (default 14 days)

#### SiteDomain (Enhanced)
Manages custom domains with verification:
- `vercelDomainId`, `vercelConfigurationId`: Vercel API references
- `verificationMethod`, `verificationToken`: DNS verification data
- `dnsRecords`, `verificationRecords`: Required DNS configuration (JSON)
- `status`: PENDING_VERIFICATION → VERIFYING → ACTIVE/FAILED
- `failedAt`, `errorMessage`: Error tracking

### Key Components

#### Prospect Workflow
1. **SendToProspectDialog** (`components/prospects/SendToProspectDialog.tsx`)
   - Create shareable review link
   - Collect prospect email and optional message
   - Generates unique token URL

2. **ProspectApprovalForm** (`components/prospects/ProspectApprovalForm.tsx`)
   - Public form for prospect response
   - Approve/decline buttons
   - Optional domain input
   - Feedback collection

3. **Preview Page** (`app/preview/[token]/page.tsx`)
   - Public-accessible (no auth)
   - Shows site preview in iframe
   - Displays approval form if not yet responded

#### Domain Management

1. **DomainSetupDialog** (`components/domains/DomainSetupDialog.tsx`)
   - Add custom domain flow
   - Two-step process: input → verification

2. **DomainVerification** (`components/domains/DomainVerification.tsx`)
   - Resend-style DNS record display
   - Copy-to-clipboard for all DNS values
   - Real-time verification checking
   - Help resources for common DNS providers

3. **DomainStatus** (`components/domains/DomainStatus.tsx`)
   - Visual status badges
   - Color-coded indicators (pending/verifying/active/failed)

4. **DnsRecordsList** (`components/domains/DnsRecordsList.tsx`)
   - Displays A, CNAME, TXT records
   - Individual copy buttons
   - Record type badges

### Server Actions

#### Prospect Actions (`app/actions/prospect.ts`)
- `createProspectReviewAction()`: Create review invitation
- `getProspectReviewByTokenAction()`: Public access to review (no auth)
- `respondToProspectReviewAction()`: Handle approve/decline
- `listSiteProspectReviewsAction()`: List all reviews for a site
- `resendProspectReviewAction()`: Resend expired/pending review
- `cancelProspectReviewAction()`: Delete review

#### Domain Actions (`app/actions/domain.ts`)
- `addDomainToEnvironmentAction()`: Add domain + trigger Vercel API
- `verifyDomainAction()`: Trigger DNS verification check
- `refreshDomainStatusAction()`: Update DNS records from Vercel
- `removeDomainAction()`: Delete domain from Vercel + database
- `getDomainDnsRecordsAction()`: Get DNS configuration

### Vercel Integration

#### Domain Service (`lib/vercel/domain-service.ts`)
Wraps Vercel API v9/v10:
- `addDomainToProject()`: POST /v10/projects/{id}/domains
- `getDomainConfig()`: GET /v9/projects/{id}/domains/{domain}/config
- `getDomain()`: GET /v9/projects/{id}/domains/{domain}
- `verifyDomain()`: POST /v9/projects/{id}/domains/{domain}/verify
- `getDomainVerificationRecords()`: Parse DNS + verification records
- `checkDomainVerification()`: Poll verification status

#### DNS Record Types
- **A Record**: Apex domain (example.com) → Vercel IP
- **CNAME Record**: Subdomain (www.example.com) → cname.vercel-dns.com
- **TXT Record**: Domain ownership verification (_vercel token)

## Workflows

### 1. Send to Prospect Flow

```
Agency User → Send to Prospect Dialog
   ↓
Enter prospect email + message
   ↓
Create ProspectReview (status: PENDING)
   ↓
Generate unique share token
   ↓
Copy/share link: /preview/{token}
   ↓
(TODO: Email notification to prospect)
```

### 2. Prospect Approval Flow

```
Prospect clicks link → /preview/{token}
   ↓
Mark as VIEWED (first time)
   ↓
Display site preview + approval form
   ↓
Prospect approves (optional domain)
   ↓
Update ProspectReview (status: APPROVED)
   ↓
If domain provided:
   - Update Site status: READY_FOR_TRANSFER
   - Trigger domain setup
Else:
   - Update Site status: LIVE
   - Ready for Vercel subdomain deployment
```

### 3. Domain Verification Flow (Resend-Style)

```
Add Domain → Vercel API call
   ↓
Receive verification challenge
   ↓
Display DNS records:
   - TXT record for ownership
   - A/CNAME for routing
   ↓
User adds records to DNS provider
   ↓
User clicks "Verify DNS Records"
   ↓
Call Vercel verify endpoint
   ↓
Poll verification status
   ↓
If verified:
   - Update domain status: ACTIVE
   - Trigger deployment
Else:
   - Show error message
   - Allow retry
```

### 4. Automated Verification (Cron Job)

```
checkPendingDomains() runs every hour
   ↓
Find domains: PENDING_VERIFICATION | VERIFYING
   ↓
For each domain:
   - Call verifyDomainAction()
   - Update status
   ↓
If verified:
   - Call handleDomainVerified()
   - Update site status: LIVE
   - (TODO: Trigger Vercel deployment)
```

## Environment Variables

```env
# Vercel Authentication
VERCEL_TOKEN=<your_vercel_token>
VERCEL_TEAM_ID=<your_team_id>

# Optional: Default Vercel project
VERCEL_PROJECT_ID=<default_project_id>

# App URL for preview links
NEXT_PUBLIC_APP_URL=https://your-app.com

# Email (for future notifications)
RESEND_API_KEY=<your_resend_key>  # Optional
```

## Usage

### For Agency Users

1. **Send site to prospect:**
   - Go to project detail page
   - Click "Send to Prospect"
   - Enter prospect email and message
   - Copy share link or wait for email notification

2. **Track responses:**
   - View "Prospect Reviews" card on project page
   - See status: Pending/Viewed/Approved/Declined
   - See requested domain if provided
   - Read prospect feedback

3. **Setup custom domain:**
   - Click "Manage Domains" on project page
   - Enter domain name
   - Follow DNS instructions
   - Click "Verify DNS Records" when ready

### For Prospects (No Login Required)

1. **Open review link:** `/preview/{token}`
2. **View site preview** in iframe
3. **Provide feedback** (optional)
4. **Enter domain** (optional)
5. **Click "Approve & Continue"** or "Not Ready Yet"

## DNS Provider Guides

The system includes links to DNS setup guides for:
- **Cloudflare**: CNAME/A record configuration
- **GoDaddy**: DNS management
- **Namecheap**: DNS settings

Users can also check DNS propagation at external tools.

## Future Enhancements

### Email Notifications (TODO)
- Send review invitation email via Resend
- Notify agency when prospect responds
- Reminder emails for pending reviews
- Domain verification success email

### Deployment Automation (TODO)
- Auto-deploy to Vercel when domain verified
- Assign custom domain to deployment
- Create SiteDeployment record
- Webhook for deployment status updates

### Advanced Features
- Bulk domain operations
- Domain transfer between projects
- SSL certificate management (handled by Vercel)
- Custom DNS record editor
- Domain analytics and health monitoring

## Troubleshooting

### Domain Verification Fails
1. **Check DNS propagation:** Use dns.google.com or dnschecker.org
2. **Wait 5-10 minutes:** DNS changes take time
3. **Verify record values:** Use copy buttons to ensure accuracy
4. **Check TTL:** Lower TTL values propagate faster
5. **Contact DNS provider:** Some providers have delays

### Prospect Review Expired
1. Use "Resend" button to extend expiration
2. New 14-day window from resend date
3. Same link remains valid

### Preview Not Loading
1. Ensure site has active version
2. Check PREVIEW environment has deployment
3. Verify iframe sandbox permissions

## API Reference

See inline documentation in:
- `lib/vercel/domain-service.ts`: Vercel API wrapper
- `app/actions/domain.ts`: Domain management actions
- `app/actions/prospect.ts`: Prospect review actions
- `lib/workflows/approval-to-deployment.ts`: Automation workflows
