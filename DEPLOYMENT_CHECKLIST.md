# 🚀 Quick Deployment Checklist

Use this checklist before deploying to Vercel.

## ✅ Pre-Deployment

- [ ] All changes committed and pushed to GitHub
- [ ] `.env` file is NOT committed (check `.gitignore`)
- [ ] All dependencies are in `package.json`
- [ ] Build works locally: `npm run build`
- [ ] Server runs locally: `npm run dev`

## 🔧 Vercel Setup

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy (First Time)
```bash
cd /Users/drewsepeczi/RecruitBox
vercel
```

Follow prompts:
- Link to existing project? → **No**
- Project name? → **recruitbox**
- Directory? → **./** (current directory)
- Override settings? → **No**

### 4. Set Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables (copy from your `.env` file):

```bash
# Database (use production database URL)
DATABASE_URL=

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZW5qb3llZC1tb3VzZS04MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_d701Rs6q4H5na1e4VKbP5oOL8ES03JAkdOhTlDjKZt

# Polar
POLAR_ACCESS_TOKEN=polar_oat_fvfDfUTK6KpLgDcqOhdVcrjD7URDO2GsgnKSJ2dQuBx
POLAR_WEBHOOK_SECRET=polar_whs_WNZeyEiEOdKgBtLeyf1m6EoPq5Wh9ZGCgNC0S1iMze6
POLAR_STARTER_PRODUCT_ID=2563bb04-5461-45dd-b33a-aa56a5626447
POLAR_STARTER_PRICE_IDS=2563bb04-5461-45dd-b33a-aa56a5626447
POLAR_AGENCY_PRODUCT_ID=ab65aaa7-2aac-4b9b-b36e-08fa24d638e9
POLAR_AGENCY_PRICE_IDS=ab65aaa7-2aac-4b9b-b36e-08fa24d638e9

# Gemini
GEMINI_API_KEY=AIzaSyDktbQ3RUgl7CrSQkn5e_4mk_qPb9ARWS0
```

### 5. Set Up Production Database

**Option A: Vercel Postgres (Recommended)**
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy `DATABASE_URL` connection string
3. Add to Environment Variables
4. Run migrations:
   ```bash
   vercel env pull .env.production
   DATABASE_URL="<your-vercel-postgres-url>" npx prisma migrate deploy
   ```

**Option B: Supabase**
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Add to Vercel Environment Variables
4. Run migrations:
   ```bash
   DATABASE_URL="<your-supabase-url>" npx prisma migrate deploy
   ```

### 6. Deploy to Production
```bash
vercel --prod
```

## 🔄 Update External Services

### Clerk Dashboard
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Settings → Domains
4. Add your Vercel domain: `https://your-app.vercel.app`

### Polar Dashboard
1. Go to [polar.sh](https://polar.sh)
2. Settings → Webhooks
3. Update webhook URL from:
   - Old: `https://wan-saccharolytic-rufina.ngrok-free.dev/api/webhooks/polar`
   - New: `https://your-app.vercel.app/api/webhooks/polar`
4. Verify webhook secret matches `POLAR_WEBHOOK_SECRET`

## ✅ Post-Deployment Testing

Test these in order:

1. **Frontend Loads**
   - [ ] Visit `https://your-app.vercel.app`
   - [ ] No console errors
   - [ ] Styling looks correct

2. **API Health Check**
   - [ ] Visit `https://your-app.vercel.app/api/`
   - [ ] Should see: "RecruitBox API is running!"

3. **Authentication**
   - [ ] Click "Sign In"
   - [ ] Clerk modal opens
   - [ ] Can create account
   - [ ] Redirects back to app

4. **Checkout Flow**
   - [ ] Go to pricing page
   - [ ] Click "Get Started" on Agency plan
   - [ ] Redirects to Polar checkout
   - [ ] Complete test purchase (use Polar test mode)
   - [ ] Redirects back to app
   - [ ] Subscription shows as active

5. **Customer Portal**
   - [ ] Click "Manage Subscription"
   - [ ] Polar customer portal opens
   - [ ] Can view subscription details

6. **Webhooks**
   - [ ] Check Vercel Logs (Dashboard → Deployments → Functions)
   - [ ] Verify webhook events are received
   - [ ] Check database for subscription record

## 🐛 Common Issues

### Build Fails
```bash
# Check build locally first
npm run vercel-build

# If it works locally but fails on Vercel:
# - Check Node version (Vercel uses Node 18 by default)
# - Verify all dependencies are in package.json
# - Check Vercel build logs for specific errors
```

### Database Connection Fails
```bash
# Verify DATABASE_URL is set in Vercel
# Run Prisma generate:
npx prisma generate

# Check Prisma schema matches production DB
npx prisma db push
```

### Polar Webhooks Not Working
1. Verify webhook URL in Polar Dashboard
2. Check `POLAR_WEBHOOK_SECRET` matches
3. View Vercel function logs for errors
4. Test webhook manually using Polar Dashboard

### CORS Errors
Update `server/index.ts`:
```typescript
app.use('/*', cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}))
```

## 📊 Monitoring

- **Vercel Logs**: Dashboard → Deployments → [Your Deployment] → Functions
- **Polar Dashboard**: Monitor subscriptions and webhooks
- **Clerk Dashboard**: Track user signups and sessions
- **Database**: Use Prisma Studio or your DB provider's dashboard

## 🔄 Continuous Deployment

Every push to `main` branch automatically deploys to production!

To preview changes before production:
```bash
# Create a preview deployment
vercel

# When ready, promote to production
vercel --prod
```

## 📝 Notes

- Vercel has a **10-second timeout** for serverless functions (hobby plan)
- Upgrade to Pro for 60-second timeout if needed
- Database connections are pooled automatically
- Environment variables can be different per environment (Production/Preview/Development)

---

**Ready to deploy?** Run `vercel` and follow the prompts!
