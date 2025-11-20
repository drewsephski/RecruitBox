# Pricing Buttons Production Fix 🔧

## Issue Summary
Pricing buttons not working in Vercel production despite correct environment variables.

## Root Causes Identified

### 1. **Missing Error Logging**
- No console logs to debug what's happening when buttons are clicked
- Silent failures made it impossible to diagnose issues

### 2. **No Loading State**
- Users could double-click buttons, causing race conditions
- No visual feedback during checkout process

### 3. **Poor Error Handling**
- Generic error messages didn't help identify the actual problem
- Errors weren't being caught and displayed properly

### 4. **API Call Issues**
- Relative URLs might not resolve correctly in production
- No validation that API endpoints are reachable

## Fixes Applied ✅

### 1. **Comprehensive Logging**
All checkout-related functions now log with `[Checkout]`, `[UserSync]`, and `[CustomerPortal]` prefixes:

```typescript
// Before: Silent failure
const response = await fetch('/api/checkout', {...});

// After: Detailed logging
console.log('[Checkout] Calling /api/checkout...');
const response = await fetch('/api/checkout', {...});
console.log('[Checkout] Response status:', response.status);
```

### 2. **Loading State Management**
Added `checkoutLoading` state to prevent double-clicks:

```typescript
// Prevents duplicate checkout attempts
if (checkoutLoading) {
  console.log('[Checkout] Already processing, ignoring duplicate click');
  return;
}
```

Buttons now show "Processing..." during checkout.

### 3. **Better Error Messages**
```typescript
// Before
alert('Failed to start checkout. Please try again.');

// After
const errorMessage = error instanceof Error ? error.message : 'Unknown error';
alert(`Failed to start checkout: ${errorMessage}\n\nPlease try again or contact support.`);
```

### 4. **API Utility Module**
Created `/services/api.ts` for centralized API calls with proper error handling.

## Files Modified

1. **`contexts/UserContext.tsx`**
   - Added `checkoutLoading` state
   - Enhanced logging in `proceedToCheckout`, `syncUser`, `openCustomerPortal`
   - Better error handling and user feedback
   - Prevents double-clicks

2. **`components/PricingSection.tsx`**
   - Uses `checkoutLoading` state
   - Shows "Processing..." during checkout
   - Logs button clicks
   - Prevents clicks while loading

3. **`services/api.ts`** (NEW)
   - Centralized API configuration
   - Helper function for API calls with logging

4. **`server/index.ts`** (from previous fix)
   - Enhanced CORS for production
   - Detailed logging in `/api/checkout`
   - `/api/health` endpoint for debugging

## Testing in Production

### Step 1: Deploy the Fixes

```bash
git add .
git commit -m "Fix pricing buttons with enhanced logging and error handling"
git push origin main
vercel --prod
```

### Step 2: Check Environment Variables

Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "environment": {
    "hasPolarToken": true,
    "hasStarterProduct": true,
    "hasAgencyProduct": true,
    ...
  }
}
```

If any are `false`, add them in Vercel Dashboard → Settings → Environment Variables.

### Step 3: Test Pricing Buttons

1. **Open your production site**
2. **Open browser console** (F12 → Console tab)
3. **Click a pricing button** (e.g., "Start Free Trial")
4. **Watch the console logs**:

You should see:
```
[PricingSection] Agency button clicked
[Checkout] Starting checkout flow { tier: 'agency', userId: '...', email: '...' }
[Checkout] Calling /api/checkout...
[Checkout] Response status: 200
[Checkout] Checkout session created: { url: 'https://...' }
[Checkout] Redirecting to: https://...
```

### Step 4: Check for Errors

If you see errors in the console, they will now be detailed:

**Common Error Patterns:**

#### Error: "Failed to fetch"
```
[Checkout] Failed to start checkout: TypeError: Failed to fetch
```
**Cause**: Network issue or CORS problem
**Fix**: Check Vercel function logs, verify CORS configuration

#### Error: "Payment system not configured"
```
[Checkout] API error: { error: 'Payment system not configured' }
```
**Cause**: Missing `POLAR_ACCESS_TOKEN`
**Fix**: Add to Vercel environment variables

#### Error: "No product configured for tier"
```
[Checkout] API error: { error: 'No product configured for tier agency' }
```
**Cause**: Missing `POLAR_AGENCY_PRODUCT_ID` or `POLAR_STARTER_PRODUCT_ID`
**Fix**: Add to Vercel environment variables

#### Error: "User already has an active subscription"
```
[Checkout] User already subscribed, redirecting to portal
[CustomerPortal] Opening customer portal for user: ...
```
**This is normal behavior** - user will be redirected to manage their subscription

## Debugging Production Issues

### 1. Check Browser Console

**What to look for:**
- `[PricingSection]` logs when button is clicked
- `[Checkout]` logs showing the checkout flow
- Any error messages

**If you see nothing:**
- JavaScript might not be loading
- Check Network tab for failed script loads
- Check for Content Security Policy errors

### 2. Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to Deployments → Latest → Functions
4. Look for `/api/checkout` function
5. Check logs for `[Checkout]` prefixed messages

**What to look for:**
```
[Checkout] Received request: { tier: 'agency', ... }
[Checkout] Resolved tier config: { productId: '...' }
[Checkout] Creating checkout with params: { ... }
[Checkout] Successfully created checkout: { checkoutId: '...', url: '...' }
```

### 3. Test API Endpoint Directly

```bash
# Replace with your actual values
curl -X POST https://your-app.vercel.app/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "agency",
    "email": "test@example.com",
    "clerkId": "user_test123"
  }'
```

**Expected response:**
```json
{
  "url": "https://checkout.polar.sh/..."
}
```

**Error response:**
```json
{
  "error": "Payment system not configured",
  "detail": "Missing access token",
  "timestamp": "2025-11-20T19:30:00.000Z"
}
```

### 4. Check Network Tab

1. Open DevTools → Network tab
2. Click a pricing button
3. Look for the `/api/checkout` request

**Check:**
- Status code (should be 200)
- Response body
- Request headers
- Response time

## Common Production Issues

### Issue: Button clicks do nothing

**Symptoms:**
- No console logs
- No network requests
- Button doesn't change to "Processing..."

**Possible Causes:**
1. JavaScript error preventing execution
2. Event handler not attached
3. React not hydrating properly

**Debug Steps:**
1. Check browser console for JavaScript errors
2. Verify React is loaded: `window.React` should exist
3. Check if button has `onClick` handler in DOM inspector

### Issue: "Processing..." never goes away

**Symptoms:**
- Button shows "Processing..."
- No redirect happens
- Console shows error

**Possible Causes:**
1. API call failed
2. Network timeout
3. CORS blocking the request

**Debug Steps:**
1. Check console for error messages
2. Check Network tab for failed requests
3. Look at Vercel function logs

### Issue: Redirects to wrong URL

**Symptoms:**
- Redirects to localhost or wrong domain
- Gets 404 error

**Possible Causes:**
1. `origin` header not set correctly
2. Polar checkout URL is wrong

**Debug Steps:**
1. Check console log: `[Checkout] Using origin: ...`
2. Check Polar dashboard for checkout session
3. Verify `successUrl` and `returnUrl` in server logs

## Environment Variables Checklist

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```bash
# Required for checkout to work
POLAR_ACCESS_TOKEN=polar_oat_...          # ✅ CRITICAL
POLAR_STARTER_PRODUCT_ID=...              # ✅ CRITICAL
POLAR_AGENCY_PRODUCT_ID=...               # ✅ CRITICAL

# Required for user authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...    # ✅ CRITICAL
CLERK_SECRET_KEY=sk_test_...              # ✅ CRITICAL

# Required for webhooks
POLAR_WEBHOOK_SECRET=polar_whs_...        # ✅ CRITICAL

# Required for database
DATABASE_URL=...                           # ✅ CRITICAL

# Optional but recommended
GEMINI_API_KEY=...                        # For AI features
```

## Verification Checklist

After deploying, verify:

- [ ] `/api/health` shows all env vars configured
- [ ] Browser console shows `[PricingSection]` log when clicking button
- [ ] Browser console shows `[Checkout]` logs during checkout flow
- [ ] Button changes to "Processing..." when clicked
- [ ] Redirects to Polar checkout page
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs
- [ ] Can complete test purchase
- [ ] Redirects back to app after purchase

## Still Not Working?

If pricing buttons still don't work after following this guide:

1. **Collect diagnostic information:**
   - Browser console logs (full output)
   - Network tab showing `/api/checkout` request
   - Vercel function logs for `/api/checkout`
   - `/api/health` endpoint response

2. **Check Polar Dashboard:**
   - Are the product IDs correct?
   - Is the access token valid?
   - Are there any failed checkout attempts?

3. **Try a different browser:**
   - Test in Chrome, Firefox, and Safari
   - Test in incognito/private mode
   - Check if browser extensions are blocking requests

4. **Verify Clerk is working:**
   - Can you sign in/sign up?
   - Does `user` object exist in console?
   - Check Clerk dashboard for user sessions

## Success Indicators

You'll know it's working when:

1. ✅ Clicking button shows detailed console logs
2. ✅ Button changes to "Processing..."
3. ✅ Console shows successful API call
4. ✅ Redirects to Polar checkout page
5. ✅ Can complete purchase
6. ✅ Redirects back with success message

---

**Next Steps:** See `PRODUCTION_FIXES.md` for the complete production deployment guide.
