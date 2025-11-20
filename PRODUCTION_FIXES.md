# Production Deployment Fixes

## Issues Fixed

### 1. ✅ Scrolling Issue
**Problem**: Page not scrollable in Vercel production build.

**Root Cause**: The `smooth-scrollbar` library was failing to load or initialize in production, leaving the page with `overflow: hidden` and no scroll mechanism.

**Solution**: 
- Implemented dynamic import of `smooth-scrollbar` with try-catch error handling
- Added fallback to native browser scrolling if smooth-scrollbar fails to load
- The scroll container now automatically switches to `overflow: auto` when smooth-scrollbar is unavailable

**Files Modified**:
- `App.tsx` - Added async initialization with fallback

### 2. ✅ Checkout Sessions Not Working
**Problem**: Polar checkout sessions failing in production despite correct environment variables.

**Root Causes**:
1. CORS configuration was too permissive and not handling Vercel domains properly
2. Missing error logging made debugging impossible
3. No validation of environment variables before attempting checkout

**Solutions**:
- Enhanced CORS configuration to explicitly allow Vercel domains (*.vercel.app)
- Added comprehensive logging throughout the checkout flow with `[Checkout]` prefixes
- Added environment variable validation before creating checkout sessions
- Improved error messages with timestamps and detailed information
- Better origin detection using both `origin` and `referer` headers

**Files Modified**:
- `server/index.ts` - Enhanced CORS and checkout endpoint

### 3. ✅ User Sync & Checkout Timeouts
**Problem**: "User sync timeout" and "Subscription check timeout" errors in console, followed by 504 Gateway Timeout during checkout.

**Root Causes**:
1. **Aggressive Client Timeouts**: The frontend had a hardcoded 5-second timeout for backend operations, which is too short for Vercel cold starts (serverless functions waking up).
2. **SQLite on Vercel**: The project is configured with SQLite, which is **incompatible** with Vercel's read-only, ephemeral filesystem, causing hangs and errors.
3. **Unhandled 504 Errors**: The checkout flow didn't gracefully handle server timeouts.

**Solutions**:
1. **Increased Timeouts**: Updated `UserContext.tsx` to wait 15 seconds (up from 5s) for sync and subscription checks.
2. **Better Error Handling**: Added specific handling for 504 Gateway Timeouts to prompt the user to retry.
3. **Database Migration Guide**: Created `MIGRATION_GUIDE.md` to help migrate from SQLite to PostgreSQL (Required for Vercel).

**Files Modified**:
- `contexts/UserContext.tsx` - Increased timeouts and improved error handling
- `MIGRATION_GUIDE.md` - Created migration instructions

## Deployment Checklist

### Before Deploying

1. **Verify Environment Variables in Vercel Dashboard**
   ```
   Required Variables:
   - DATABASE_URL
   - VITE_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - POLAR_ACCESS_TOKEN ⚠️ CRITICAL
   - POLAR_WEBHOOK_SECRET
   - POLAR_STARTER_PRODUCT_ID
   - POLAR_AGENCY_PRODUCT_ID
   - GEMINI_API_KEY
   ```

2. **Test Locally First**
   ```bash
   bun run build
   bun run preview
   ```

3. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Fix production scrolling and checkout issues"
   git push origin main
   ```

### Deploy to Vercel

```bash
vercel --prod
```

### After Deployment

1. **Test Scrolling**
   - Visit your production URL
   - Open browser console (F12)
   - Look for: "smooth-scrollbar not available, using native scroll" (this is OK!)
   - Verify you can scroll the page

2. **Test Checkout Flow**
   - Click "Get Started" on a pricing plan
   - Check browser console for `[Checkout]` logs
   - Verify redirect to Polar checkout page
   - Complete test purchase

3. **Monitor Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → Functions
   - Look for `/api/checkout` function logs
   - Check for `[Checkout]` prefixed messages

## Debugging Production Issues

### If Scrolling Still Doesn't Work

1. **Check Browser Console**
   ```
   Look for errors related to:
   - smooth-scrollbar
   - overflow styles
   ```

2. **Verify CSS is Loading**
   - Open DevTools → Network tab
   - Check if `index.css` loads successfully
   - Verify no 404 errors for CSS files

3. **Test with Different Browsers**
   - Chrome/Edge
   - Firefox
   - Safari

### If Checkout Still Fails

1. **Check Vercel Function Logs**
   ```
   Look for:
   [Checkout] Received request: {...}
   [Checkout] Resolved tier config: {...}
   [Checkout] Creating checkout with params: {...}
   [Checkout] Successfully created checkout: {...}
   ```

2. **Verify Environment Variables**
   ```bash
   # In Vercel Dashboard, check that all variables are set
   # Pay special attention to POLAR_ACCESS_TOKEN
   ```

3. **Test API Endpoint Directly**
   ```bash
   curl -X POST https://your-app.vercel.app/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"tier":"agency","email":"test@example.com","clerkId":"test_clerk_id"}'
   ```

4. **Check CORS Headers**
   ```bash
   # Should see Access-Control-Allow-Origin in response
   curl -I https://your-app.vercel.app/api/checkout
   ```

## Common Production Errors

### Error: "Payment system not configured"
**Fix**: Set `POLAR_ACCESS_TOKEN` in Vercel environment variables

### Error: "No product configured for tier"
**Fix**: Set `POLAR_STARTER_PRODUCT_ID` and `POLAR_AGENCY_PRODUCT_ID` in Vercel

### Error: CORS policy blocking requests
**Fix**: Verify your production URL is a `.vercel.app` domain or add it to `PRODUCTION_URL` env var

### Page loads but is blank/white
**Fix**: 
1. Check browser console for JavaScript errors
2. Verify `dist/` folder was built correctly
3. Check Vercel build logs for errors

## Monitoring

### Key Metrics to Watch

1. **Function Execution Time**
   - `/api/checkout` should complete in < 2 seconds
   - If timeout errors occur, upgrade Vercel plan

2. **Error Rate**
   - Monitor Vercel dashboard for 500 errors
   - Check Polar dashboard for failed checkouts

3. **Database Connections**
   - Ensure connection pooling is working
   - Watch for "too many connections" errors

## Support

If issues persist after following this guide:

1. **Collect Diagnostic Info**
   - Browser console logs
   - Vercel function logs
   - Network tab showing failed requests
   - Environment variables (redacted)

2. **Check Vercel Status**
   - https://www.vercel-status.com/

3. **Check Polar Status**
   - https://polar.sh/status

## Next Steps

Once deployment is successful:

1. Update Polar webhook URL to production domain
2. Update Clerk allowed domains
3. Set up monitoring/alerting
4. Configure custom domain (optional)
5. Enable Vercel Analytics (optional)
