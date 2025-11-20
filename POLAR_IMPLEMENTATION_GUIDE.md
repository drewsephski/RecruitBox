# Polar Implementation Guide

This guide outlines the integration of Polar.sh for subscriptions and payments in the RecruitBox application. It covers the current setup, best practices extracted from Polar documentation, and troubleshooting steps for common issues.

## 1. Configuration

### Environment Variables
Ensure the following environment variables are set in your `.env` file:

```env
# Polar API Access
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret

# Product IDs (from Polar Dashboard)
POLAR_STARTER_PRODUCT_ID=your_starter_product_id
POLAR_AGENCY_PRODUCT_ID=your_agency_product_id

# Optional: Price IDs if needed for specific logic
POLAR_STARTER_PRICE_IDS=...
POLAR_AGENCY_PRICE_IDS=...
```

## 2. Backend Implementation (`server/index.ts`)

The backend uses the `@polar-sh/sdk` to interact with Polar APIs.

### Initialization
```typescript
import { Polar } from '@polar-sh/sdk'

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: 'production',
})
```

### Key Endpoints

#### `POST /api/checkout`
Creates a checkout session for a specific product tier.
- **Input**: `{ tier: 'starter' | 'agency', email: string, clerkId: string }`
- **Logic**:
    1. Resolves `productId` based on the tier.
    2. Calls `polar.checkouts.create` with `successUrl`, `returnUrl`, and metadata.
    3. Returns the checkout URL.

#### `POST /api/customer-portal/session`
Creates a session for the customer to manage their subscription.
- **Input**: `{ clerkId: string }`
- **Logic**:
    1. Checks if a local user exists.
    2. Attempts to create a portal session using `polar.customerSessions.create`.
    3. **Auto-Provisioning**: If the customer doesn't exist in Polar (404 error), it attempts to create the customer using `polar.customers.create` and then retries creating the session.

#### `POST /api/webhooks/polar`
Handles asynchronous events from Polar to keep local database in sync.
- **Events Handled**:
    - `checkout.updated`: Syncs subscription if successful, deletes if failed.
    - `subscription.created`, `subscription.updated`: Syncs subscription status and period.
    - `subscription.cancelled`: Updates status to cancelled.
- **Verification**: Verifies webhook signature using `standardwebhooks`.

## 3. Frontend Implementation (`contexts/UserContext.tsx`)

The `UserContext` manages the subscription state and exposes methods to trigger checkout and portal access.

### Key Methods

- **`upgradeToPro(tier)`**: Initiates the checkout flow.
    - Calls `/api/checkout`.
    - Redirects user to the returned Polar checkout URL.
- **`openCustomerPortal()`**: Opens the billing portal.
    - Calls `/api/customer-portal/session`.
    - Redirects user to the portal URL.
- **`checkSubscription()`**: Polls `/api/subscription/:clerkId` to update `isPro` status.

## 4. Best Practices & Enhancements

Based on Polar documentation and current setup analysis.

### Customer Identity & Metadata
- **External ID**: Always use `clerkId` as the `external_id` in Polar. This ensures a 1:1 mapping between your auth system and Polar.
- **Metadata**: Store `clerkId` and `tier` in metadata for easier debugging and reconciliation.

### Subscription Upgrades/Downgrades
- **Current Issue**: The current implementation simply creates a new checkout session. If a user already has a subscription, this might lead to duplicate subscriptions or confusion.
- **Recommendation**:
    - Before creating a checkout session, check if the user already has an active subscription.
    - If they do, use the **Customer Portal** or a specific "Update Subscription" flow if supported by the product configuration (e.g., proration).
    - For upgrades, ensure the checkout session is configured to *replace* the existing subscription if necessary, or guide the user to the portal.

### Customer Portal Access
- **Current Issue**: "Can't access the portal" errors often occur if the customer record doesn't exist in Polar yet.
- **Robustness**: The auto-provisioning logic in `server/index.ts` is good, but ensure:
    - The `email` matches the one used for checkout.
    - The `external_id` is consistently used.
    - Handle race conditions where a webhook might create the customer in parallel.

### Webhook Reliability
- **Idempotency**: Ensure webhook processing is idempotent. The current `upsert` logic in `syncSubscriptionRecord` is good for this.
- **Missing Events**: If webhooks fail, the local state might be stale. Implement a daily reconciliation job or a "Refresh" button (already present in `UserContext`) that fetches the latest state from Polar API directly.

## 5. Troubleshooting Guide

### "Can't Upgrade Subscription"
- **Cause**: User might already have a subscription.
- **Fix**: Check if `isPro` is true. If so, redirect to Customer Portal instead of Checkout, or use a checkout flow specifically for upgrades (if Polar supports "upgrade" checkouts directly, otherwise Portal is best).

### "Can't Access Portal"
- **Cause**: Customer record missing in Polar or `external_id` mismatch.
- **Fix**:
    - Check server logs for "Failed to auto-create Polar customer".
    - Verify that the `clerkId` sent to `/api/customer-portal/session` matches the `external_id` of the customer in Polar.
    - If the user paid with a different email than their Clerk email, Polar might have created a *new* customer record without the `external_id`. You may need to link them manually or ask the user to use the same email.

### "Subscription Not Active After Payment"
- **Cause**: Webhook delay or failure.
- **Fix**:
    - Check `webhook-signatures.log`.
    - Use the "Refresh Subscription" button in the UI.
    - Verify `POLAR_WEBHOOK_SECRET` is correct.

## 6. Implemented Improvements

1.  **Enhanced `/api/checkout`**:
    - Checks if user already has an active subscription.
    - Returns `ALREADY_SUBSCRIBED` error code if active.

2.  **Enhanced Frontend (`UserContext.tsx`)**:
    - `proceedToCheckout` handles `ALREADY_SUBSCRIBED` by automatically redirecting to the **Customer Portal**.
    - `openCustomerPortal` has improved error messaging for users.

3.  **UX Improvements**:
    - Users are prevented from accidentally creating duplicate subscriptions.
    - Seamless redirection to portal for existing subscribers.
