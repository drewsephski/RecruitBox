# 🎯 Quick Deploy to Vercel

## One-Command Deploy

```bash
./deploy.sh
```

Or manually:

```bash
# 1. Install Vercel CLI (first time only)
npm i -g vercel

# 2. Login (first time only)
vercel login

# 3. Deploy
vercel --prod
```

## After First Deployment

### 1️⃣ Set Environment Variables in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Copy these from your `.env` file:
- `DATABASE_URL` (use production database)
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`
- `POLAR_STARTER_PRODUCT_ID`
- `POLAR_STARTER_PRICE_IDS`
- `POLAR_AGENCY_PRODUCT_ID`
- `POLAR_AGENCY_PRICE_IDS`
- `GEMINI_API_KEY`

### 2️⃣ Set Up Production Database

**Vercel Postgres** (Recommended):
```bash
# In Vercel Dashboard: Storage → Create Database → Postgres
# Then run migrations:
vercel env pull .env.production
DATABASE_URL="<from-vercel>" npx prisma migrate deploy
```

### 3️⃣ Update External Services

**Clerk**: Add your Vercel domain to allowed origins
- Dashboard: https://dashboard.clerk.com
- Settings → Domains → Add `https://your-app.vercel.app`

**Polar**: Update webhook URL
- Dashboard: https://polar.sh
- Settings → Webhooks → Update to `https://your-app.vercel.app/api/webhooks/polar`

### 4️⃣ Test Deployment

1. ✅ Visit `https://your-app.vercel.app`
2. ✅ Sign in with Clerk
3. ✅ Go to pricing page
4. ✅ Click "Get Started"
5. ✅ Complete checkout
6. ✅ Verify subscription is active

## 🔄 Continuous Deployment

Every push to `main` automatically deploys to production!

## 📚 Full Documentation

- **Detailed Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`

## 🆘 Need Help?

Check Vercel logs: **Dashboard → Deployments → [Your Deployment] → Functions**
