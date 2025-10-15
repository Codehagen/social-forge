# Enhanced Prospect Approval Workflow

## Overview

This document describes the improved multi-step prospect approval workflow that collects additional details before deployment.

## Workflow States

The system now uses a **5-step approval process** instead of the previous single-step:

```
1. PENDING/VIEWED      → Prospect reviews website
2. APPROVED            → Prospect approves, needs to provide details
3. DETAILS_SUBMITTED   → Details collected, processing
4. DEPLOYING           → Website being deployed
5. LIVE                → Website is live and accessible
```

## User Journey

### For Agency (Internal Users)

1. **Create Site** in AI Builder
2. **Send to Prospect** via "Send to Prospect" button
   - Enter prospect email, name, message
   - System generates unique review link
3. **Track Progress** on project detail page
   - See status: Pending → Viewed → Approved → Deploying → Live
   - View prospect feedback and submitted details
4. **Domain Management** (if custom domain requested)
   - Guide prospect through DNS setup
   - Monitor verification status

### For Prospect (External Users - No Login)

#### Step 1: Initial Review (PENDING → APPROVED)
- Click review link from email
- View website preview in iframe
- Read personalized message from agency
- **Action**: Click "Approve & Continue" or "Not Ready Yet"
- Optional: Provide feedback

#### Step 2: Provide Details (APPROVED → DETAILS_SUBMITTED)
After approval, prospect fills out:
- **Company Name** (required)
- **Contact Email** (pre-filled)
- **Phone Number** (optional)
- **Website Address Choice**:
  - ✅ **Use Free Subdomain**: `company-name-abc123.socialforge.tech`
  - ✅ **Use Custom Domain**: `www.example.com` (requires DNS setup)

#### Step 3: Deployment (DETAILS_SUBMITTED → DEPLOYING → LIVE)
- **If Free Subdomain**: Automatic deployment, 2-3 minute wait
- **If Custom Domain**: DNS verification required first, then deployment

## Technical Implementation

### Database Changes

#### ProspectReview Model (Enhanced)
```prisma
model ProspectReview {
  // ... existing fields
  companyName        String?           // NEW
  contactPhone       String?           // NEW
  additionalInfo     Json?             // NEW
  detailsSubmittedAt DateTime?         // NEW
  status             ProspectReviewStatus
}

enum ProspectReviewStatus {
  PENDING
  VIEWED
  APPROVED            // NEW: Awaiting details
  DETAILS_SUBMITTED   // NEW: Details provided
  DEPLOYING           // NEW: Deployment in progress
  LIVE                // NEW: Site is live
  DECLINED
  EXPIRED
}
```

#### SubdomainAssignment Model (New)
```prisma
model SubdomainAssignment {
  id          String   @id
  siteId      String   @unique
  subdomain   String   @unique
  isActive    Boolean  @default(true)
  createdAt   DateTime
  updatedAt   DateTime
}
```

### New Components

#### 1. ProspectDetailsForm
**Location**: `components/prospects/ProspectDetailsForm.tsx`

Features:
- Company name input with icon
- Pre-filled contact email
- Optional phone number
- Radio button choice: Free subdomain vs Custom domain
- Conditional domain input field
- Real-time preview of subdomain slug

Uses **InputGroup** components for better UX:
```tsx
<InputGroup>
  <InputGroupInput placeholder="Acme Inc." />
  <InputGroupAddon>
    <IconBuilding />
  </InputGroupAddon>
</InputGroup>
```

#### 2. DeploymentStatus
**Location**: `components/prospects/DeploymentStatus.tsx`

Two states:
- **Deploying**: Animated spinner + "What's happening?" info
- **Live**: Success checkmark + "Visit Your Website" button

Uses **Item + Spinner** pattern from requirements:
```tsx
<Item variant="muted">
  <ItemMedia>
    <Spinner />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Deploying your website...</ItemTitle>
  </ItemContent>
</Item>
```

### New Server Actions

#### submitProspectDetailsAction
**Location**: `app/actions/prospect-details.ts`

Handles the second-step submission:
1. Validates prospect has approved (status === APPROVED)
2. Updates ProspectReview with details
3. **If custom domain**:
   - Calls `addDomainToEnvironmentAction()`
   - Sets site status to READY_FOR_TRANSFER
   - Returns DNS verification instructions
4. **If subdomain**:
   - Calls `assignSubdomain()` from subdomain service
   - Sets review status to DEPLOYING
   - Triggers deployment (TODO: actual Vercel API integration)
   - Auto-transitions to LIVE after deployment

### Subdomain Service

**Location**: `lib/subdomain/service.ts`

Functions:
- `assignSubdomain(siteId, siteName)`: Generate and assign unique subdomain
- `getSubdomain(siteId)`: Retrieve existing subdomain
- `isSubdomainAvailable(subdomain)`: Check availability
- `deactivateSubdomain(siteId)`: Soft-delete subdomain

**Subdomain Format**:
```
{site-name-slug}-{random-hex}.socialforge.tech
Example: acme-inc-7f3a2b.socialforge.tech
```

### Updated Components

#### ProspectApprovalForm (Simplified)
**Removed**: Domain input field (now in step 2)
**Kept**: Feedback textarea, Approve/Decline buttons

#### Preview Page (app/preview/[token]/page.tsx)
Now handles 5 different states:
1. **PENDING/VIEWED**: Show approval form
2. **APPROVED**: Show details collection form
3. **DETAILS_SUBMITTED**: Show "Processing" message
4. **DEPLOYING**: Show spinner and deployment status
5. **LIVE**: Show success + visit website button
6. **DECLINED**: Show declined message

## Environment Variables

No new environment variables required. Uses existing:
```env
VERCEL_TOKEN=...
VERCEL_TEAM_ID=...
NEXT_PUBLIC_APP_URL=... # For preview links
```

## Deployment Flow

### Free Subdomain Path
```
Details Submitted
  ↓
Generate subdomain (e.g., acme-7f3a2b.socialforge.tech)
  ↓
Create SubdomainAssignment record
  ↓
Update status: DEPLOYING
  ↓
(TODO) Deploy to Vercel
  ↓
(TODO) Assign subdomain to deployment
  ↓
Update status: LIVE
```

### Custom Domain Path
```
Details Submitted
  ↓
Add domain to Vercel project
  ↓
Return DNS records to prospect
  ↓
Prospect configures DNS
  ↓
Verify DNS records
  ↓
Update status: DEPLOYING
  ↓
(TODO) Deploy to Vercel
  ↓
(TODO) Assign custom domain to deployment
  ↓
Update status: LIVE
```

## UI/UX Enhancements

### InputGroup Pattern
All input fields use the modern InputGroup pattern for better visual hierarchy:
- Icon indicators for field types
- Consistent styling
- Better accessibility
- Professional appearance

### Progressive Disclosure
- Step 1: Simple approve/decline choice
- Step 2: Detailed information only after approval
- Reduces cognitive load
- Higher completion rates

### Real-time Feedback
- Subdomain preview shows before submission
- Deployment progress with spinner animation
- Clear status indicators at each step
- "What's happening?" explanations

## Migration Notes

### Breaking Changes
- `ProspectReviewStatus` enum has new values
- Existing `APPROVED` reviews need migration to `DETAILS_SUBMITTED` if details exist
- Preview page URLs remain the same

### Database Migration
```bash
pnpm prisma db push
pnpm prisma generate --no-engine
```

## Testing Checklist

- [ ] Send review to prospect
- [ ] Approve review (step 1)
- [ ] Fill details form with free subdomain choice
- [ ] Verify subdomain is generated
- [ ] Check deployment status updates
- [ ] Fill details form with custom domain choice
- [ ] Verify DNS records are provided
- [ ] Test domain verification flow
- [ ] Check live status with both domain types
- [ ] Test decline flow
- [ ] Test expiration handling

## Future Enhancements

### Phase 2
- **Email Notifications**: Send emails at each step
- **Real Vercel Deployment**: Integrate actual deployment API
- **Webhook Support**: Listen for deployment status
- **Custom Subdomain Base**: Allow white-label subdomains

### Phase 3
- **Multi-language Support**: Internationalize preview page
- **Approval Comments**: Allow back-and-forth conversation
- **Version History**: Show previous site versions
- **Analytics**: Track prospect engagement metrics

## Support

For questions about this workflow:
1. See `DOMAIN_MANAGEMENT.md` for domain verification details
2. Check `lib/subdomain/service.ts` for subdomain logic
3. Review `app/actions/prospect-details.ts` for business logic
4. Test with `app/preview/[token]/page.tsx` preview page
