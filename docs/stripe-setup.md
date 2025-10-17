# Stripe Product & Pricing Setup

Use this playbook to configure Stripe so Social Forge can sell workspaces on the new pricing tiers and add-ons. The steps assume you are using the Stripe Dashboard; the same values can be created via the API if you prefer.

## 1. Pre-requisites

- Stripe account with the correct business information and payout details.
- Decide whether you are working in **Test** or **Live** mode; stay consistent throughout a session. Every product/price has separate IDs per mode.
- Gather the URLs you will need later:
  - Success redirect (e.g. `https://app.socialforge.com/dashboard`)
  - Cancel redirect (e.g. `https://app.socialforge.com/pricing`)
  - Billing portal return URL (e.g. `https://app.socialforge.com/account/billing`)

## 2. Product Strategy

- The **Free** tier remains account logic only; no Stripe product is needed.
- Create one product per paid tier (`Creator`, `Agency`, `Enterprise`) with recurring prices.
- Create separate products for each add-on:
  - `Extra AI Credits` (one-time top-ups)
  - `Extra Seats` (recurring, per-seat quantity)
  - `White-label Domain Setup` (one-time professional service)
- Annual billing is optional for now; if you want it, create a second price on the same product that bills yearly with the desired discount.

Tip: add metadata (e.g. `planKey=creator`) on products and prices. It gives you traceability without affecting checkout.

## 3. Create Tier Products & Prices

Repeat the following for each paid tier.

1. In Stripe Dashboard, go to **Products → Add product**.
2. Set the product name (`Creator`, `Agency`, `Enterprise`), description, and image if desired.
3. Under **Pricing**, pick **Recurring**:
   - **Billing period**: Monthly.
   - **Price**:
     - Creator: `$19.00 USD`.
     - Agency: `$49.00 USD`.
     - Enterprise: leave blank and create a `$0` price if you need a placeholder, but normally you will sell Enterprise via quotes—see below.
4. Disable tax if you rely on Stripe Tax later; otherwise keep default.
5. Save the product. Stripe generates a price (e.g. `price_123`); copy it somewhere safe.

### Optional: Annual Prices

1. Open the product, click **Add another price**.
2. Pick **Recurring → Yearly**.
3. Set the amount (e.g. `Creator`: `$190` for two months free; `Agency`: `$490`). Adjust values to your business policy.
4. Save; note the generated annual price ID.

### Enterprise Handling

- If Enterprise will always be custom-quoted, skip creating a public price. Instead:
  - Leave the product with no default price.
  - When you close a deal, create a customer-specific Price via **Products → Enterprise → + Add price** and set the amount and interval negotiated.
  - Mark that price as **Archive** after use if you do not want it reused.

## 4. Add-on Configuration

### Extra AI Credits

1. Add a product named `Extra AI Credits`.
2. Choose **One time** pricing.
3. Set the amount to `$10` and the unit label to `1,000 credits`.
4. Save and note the price ID. Configure checkout so customers can choose quantity if they can buy multiple blocks per purchase.

### Extra Seats

1. Add a product named `Extra Seats`.
2. Choose **Recurring → Monthly**.
3. Set the unit amount to `$5` and enable the **Allow multiple quantities** option because Stripe will use quantity to represent the number of extra seats.
4. Note the price ID; Seat quantity becomes the `seats` parameter when calling `subscription.upgrade`.

### White-label Domain Setup

1. Create a product named `White-label Domain Setup`.
2. Choose **One time** pricing at `$49`.
3. This can be sold via a separate checkout session triggered from the app or through the dashboard manually.

## 5. Capture Price IDs for the App

Collect the generated IDs and map them to environment variables. Suggested naming:

```dotenv
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_ANNUAL=price_...
STRIPE_PRICE_AGENCY_MONTHLY=price_...
STRIPE_PRICE_AGENCY_ANNUAL=price_...
STRIPE_PRICE_EXTRA_SEAT_MONTHLY=price_...
STRIPE_PRICE_EXTRA_CREDITS=price_...
STRIPE_PRICE_WHITELABEL_SETUP=price_...
```

Add these keys to `.env` for local testing and to your hosting environment (Vercel) once ready. Keep the Enterprise price ID list separate if prices vary per customer.

## 6. Webhooks & Keys

1. In Stripe Dashboard, go to **Developers → API keys** and create/retrieve:
   - **Secret key** (use the restricted key in production if desired).
   - **Publishable key** for the front end.
2. In **Developers → Webhooks**, add an endpoint for `https://your-domain.com/api/auth/stripe/webhook`.
3. Subscribe at minimum to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret**; it becomes `STRIPE_WEBHOOK_SECRET`.

## 7. Manual Testing Checklist

- Use the Stripe CLI (`stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`) to relay webhooks during local testing.
- Run through:
  1. Upgrade workspace from Free to Creator.
  2. Upgrade Creator → Agency (ensuring existing subscription is swapped, not duplicated).
  3. Purchase extra seats by supplying a larger `seats` quantity.
  4. Buy extra credits and confirm the one-time checkout succeeds.
  5. Trigger the billing portal to verify payment-method updates or cancellations.
- Inspect the `Customers`, `Subscriptions`, and `Payments` tabs in Stripe to confirm data flows correctly.

## 8. Production Cut-over Notes

- Switch Dashboard to **Live mode** and recreate the same products/prices; IDs differ between modes.
- Rotate environment variables to the live keys before deploying production.
- Verify tax settings, invoice branding, and email notifications inside Stripe.
- Consider enabling Stripe’s fraud tools (Radar rules) and setting up the dunning management strategy before launch.

Once these steps are complete, pass the final price IDs so the application code can link to them without needing seeded data.
