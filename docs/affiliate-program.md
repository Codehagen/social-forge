# Affiliate Program Implementation Notes

This document outlines how the Social Forge affiliate experience is wired so you can operate and extend it confidently.

## Data model

- `Affiliate`
  - Tied 1:1 with a `User`.
  - Stores the Stripe Connect account id (`stripeConnectId`) and current onboarding status (`stripeConnectStatus`).
  - Generates a unique, shareable `referralCode` on application.
  - Aggregates totals: clicks (manual, not yet automated), earned/paid commission (in cents), timestamps for approval.
- `Referral`
  - Records attribution from an affiliate to a downstream user/workspace.
  - Captures the lock-in lifecycle (`PENDING → LOCKED_IN → CONVERTED → PAID / CANCELLED`).
  - Holds Stripe ids (`stripeCustomerId`, `stripeSubscriptionId`) so webhook handlers can reconcile events.

Run `pnpm prisma migrate dev --name affiliate-program` (or your migration flow) then `pnpm prisma generate` after pulling these schema changes.

## Referral capture

- Middleware inspects every request for `?ref=CODE` and drops a signed cookie (`sf_ref`) for 30 days.
- During onboarding completion we call `setReferralForCurrentUser`, which locks the referral to the newly created user.
- `Referral` rows are created lazily on first contact; duplicates for the same user are prevented with unique constraints.

## Affiliate workflow

1. User visits `/affiliate` (public marketing page) and applies via `/affiliate/apply`.
2. `requestAffiliateEnrollment` stores a `PENDING` affiliate row with a generated referral code.
3. Admins review applications at `/dashboard/admin/affiliates` and promote users to `APPROVED`.
4. Approved partners use `/affiliate/dashboard` and `/affiliate/onboarding` to obtain a Stripe Connect Express onboarding link (`createAffiliateOnboardingLink`).
5. Stripe `account.updated` events update `stripeConnectStatus` automatically via the Better Auth Stripe plugin `onEvent` hook.

## Payouts & Stripe Connect

- `createAffiliateOnboardingLink` creates/retrieves the Express account, stores the `stripeConnectId`, and generates onboarding URLs using `NEXT_PUBLIC_APP_URL` as the base domain.
- Admin or automated jobs can later call the Stripe Transfers API (implement in a follow-up) to pay commissions. Placeholder aggregation logic lives in `getAffiliateDashboardData`.

## Admin tools

- Sidebar surfaces “Affiliate approvals” only for users with `agent = true`.
- Admin panel provides simple status buttons; actions call `adminUpdateAffiliateStatus`.

## Next steps

- Hook conversion logic into the Stripe subscription webhook to mark referrals as `CONVERTED`/`PAID` and issue transfers.
- Track click metrics (`totalClicks`) via a lightweight logging endpoint.
- Extend the affiliate dashboard with analytics (per-plan payouts, monthly breakdown, export CSV).
- Draft public-facing terms & conditions and automate email notifications on approval/rejection.
