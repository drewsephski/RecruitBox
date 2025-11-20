# 🚀 Vercel Deployment Guide for RecruitBox

This guide walks you through deploying your RecruitBox application to Vercel with full Polar checkout functionality.

## 📋 Prerequisites

- GitHub repository connected (✅ Already done!)
- Vercel account (sign up at [vercel.com](https://vercel.com))
- All environment variables from `.env` file

---

## 🏗️ Architecture Overview

Your app has two parts:
1. **Frontend**: Vite + React (port 3000 locally)
2. **Backend**: Hono server (port 3001 locally)

On Vercel, we'll deploy both as a single project using **Vercel Serverless Functions**.

---

## 📝 Step 1: Create Required Configuration Files

### 1.1 Create `vercel.json`

This tells Vercel how to route requests and build your app.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/server"
    }
  ],
  "functions": {
    "api/server.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### 1.2 Create Serverless Function Wrapper

Create `api/server.js` to wrap your Hono server:

```javascript
import { serve } from '@hono/node-server'
import app from '../server/app.js'

export default async function handler(req, res) {
  return serve({
    fetch: app.fetch,
    port: 0
  })(req, res)
}
```

### 1.3 Refactor Server Code

We need to separate the Hono app from the server startup. Create `server/app.ts`:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
// ... (move all your route handlers here)

config()

const app = new Hono()
app.use('/*', cors())

// ... (all your existing routes)

export default app
```

Then update `server/index.ts` to just start the server locally:

```typescript
import { serve } from '@hono/node-server'
import app from './app.js'

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
```

---

## 🔧 Step 2: Update Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:vite\" \"npm:dev:server\"",
    "dev:vite": "vite",
    "dev:server": "tsx server/index.ts",
    "build": "vite build",
    "build:server": "tsc server/app.ts --outDir api",
    "preview": "vite preview",
    "vercel-build": "npm run build && npm run build:server"
  }
}
```

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /Users/drewsepeczi/RecruitBox
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? → No
   - Project name? → recruitbox
   - Directory? → `./` (current directory)
   - Override settings? → No

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `drewsephski/RecruitBox`
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

---

## 🔐 Step 4: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

### Required Variables:
```
DATABASE_URL=<your-production-database-url>
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZW5qb3llZC1tb3VzZS04MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_d701Rs6q4H5na1e4VKbP5oOL8ES03JAkdOhTlDjKZt
POLAR_ACCESS_TOKEN=polar_oat_fvfDfUTK6KpLgDcqOhdVcrjD7URDO2GsgnKSJ2dQuBx
POLAR_WEBHOOK_SECRET=polar_whs_WNZeyEiEOdKgBtLeyf1m6EoPq5Wh9ZGCgNC0S1iMze6
POLAR_STARTER_PRODUCT_ID=2563bb04-5461-45dd-b33a-aa56a5626447
POLAR_STARTER_PRICE_IDS=2563bb04-5461-45dd-b33a-aa56a5626447
POLAR_AGENCY_PRODUCT_ID=ab65aaa7-2aac-4b9b-b36e-08fa24d638e9
POLAR_AGENCY_PRICE_IDS=ab65aaa7-2aac-4b9b-b36e-08fa24d638e9
GEMINI_API_KEY=AIzaSyDktbQ3RUgl7CrSQkn5e_4mk_qPb9ARWS0
```

### ⚠️ Important Notes:

1. **Database**: You'll need a production database. Options:
   - **Vercel Postgres** (recommended, built-in)
   - **Supabase** (free tier available)
   - **PlanetScale** (MySQL)
   - **Railway** (PostgreSQL)

2. **Clerk**: Update allowed origins in [Clerk Dashboard](https://dashboard.clerk.com):
   - Add your Vercel domain: `https://your-app.vercel.app`

3. **Polar Webhooks**: Update webhook URL in [Polar Dashboard](https://polar.sh):
   - Change from `https://wan-saccharolytic-rufina.ngrok-free.dev/api/webhooks/polar`
   - To: `https://your-app.vercel.app/api/webhooks/polar`

---

## 🗄️ Step 5: Set Up Production Database

### Using Vercel Postgres (Recommended):

1. In Vercel Dashboard → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` connection string
3. Add it to Environment Variables
4. Run migrations:
   ```bash
   # Install Vercel CLI if not already
   npm i -g vercel
   
   # Pull environment variables locally
   vercel env pull .env.production
   
   # Run Prisma migrations
   DATABASE_URL="<your-vercel-postgres-url>" npx prisma migrate deploy
   ```

### Alternative: Using Supabase:

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Format: `postgresql://postgres:[password]@[host]:5432/postgres`
4. Add to Vercel environment variables

---

## ✅ Step 6: Verify Deployment

After deployment, test these endpoints:

1. **Frontend**: `https://your-app.vercel.app`
2. **API Health**: `https://your-app.vercel.app/api/` (should return "RecruitBox API is running!")
3. **Checkout Flow**:
   - Sign up with Clerk
   - Click "Get Started" on pricing page
   - Verify Polar checkout opens
   - Complete test purchase
4. **Webhook**: Check Vercel logs for webhook events

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution**: Ensure all dependencies are in `dependencies`, not `devDependencies`:
```bash
npm install --save @hono/node-server hono @polar-sh/sdk @prisma/client dotenv
```

### Issue: Database connection fails

**Solution**: 
- Verify `DATABASE_URL` is set in Vercel
- Run `npx prisma generate` before deployment
- Check Prisma schema matches production DB

### Issue: Polar webhooks not working

**Solution**:
1. Update webhook URL in Polar Dashboard
2. Verify `POLAR_WEBHOOK_SECRET` matches
3. Check Vercel function logs for errors

### Issue: CORS errors

**Solution**: Update `server/app.ts`:
```typescript
app.use('/*', cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}))
```

### Issue: Clerk authentication fails

**Solution**:
1. Add Vercel domain to Clerk Dashboard → Domains
2. Verify `VITE_CLERK_PUBLISHABLE_KEY` is set
3. Check browser console for specific errors

---

## 🔄 Continuous Deployment

Once set up, every push to `main` branch will automatically deploy to Vercel!

To deploy a specific branch:
```bash
git checkout -b staging
git push origin staging
vercel --prod  # Deploy staging branch to production
```

---

## 📊 Monitoring

- **Vercel Logs**: Dashboard → Deployments → [Your Deployment] → Functions
- **Polar Dashboard**: Monitor subscriptions and webhooks
- **Clerk Dashboard**: Track user signups and sessions

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] User can sign up with Clerk
- [ ] Pricing page displays correctly
- [ ] Checkout redirects to Polar
- [ ] Successful checkout creates subscription in DB
- [ ] Customer portal link works
- [ ] Webhooks are received and processed
- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] Custom domain configured (optional)

---

## 🚨 Security Notes

1. **Never commit `.env` to Git** (already in `.gitignore`)
2. **Rotate secrets** if accidentally exposed
3. **Use environment-specific keys** for production
4. **Enable Vercel's Security Headers**:
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-Content-Type-Options", "value": "nosniff" }
         ]
       }
     ]
   }
   ```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Hono on Vercel](https://hono.dev/getting-started/vercel)
- [Polar Webhooks](https://docs.polar.sh/webhooks)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/production)

---

**Need help?** Check Vercel logs or reach out to support!
