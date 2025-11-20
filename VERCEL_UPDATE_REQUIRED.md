# 🚨 FINAL STEP: Update Vercel Environment Variables

The "504 Gateway Timeout" error confirms that Vercel is timing out. This is happening for two reasons:
1. **Missing Database Connection**: You updated your local `.env`, but **Vercel doesn't know about your new PostgreSQL database yet**.
2. **Short Timeout**: The default 10-second timeout is too short for the database to wake up (Neon databases "sleep" when inactive).

## ✅ Fixes Applied
1. **Increased Timeout**: I updated `vercel.json` to allow functions to run for **60 seconds** (up from 10s).

## 🫵 ACTION REQUIRED: Update Vercel Dashboard
You **MUST** do this manually in your browser:

1. Go to your **Vercel Dashboard** > Select your project.
2. Click **Settings** > **Environment Variables**.
3. Find `DATABASE_URL`.
4. **Edit** it and paste your **Neon PostgreSQL connection string** (the same one you put in your local `.env`).
   - It should look like: `postgresql://neondb_owner:password@ep-morning-sun...neon.tech/neondb?sslmode=require`
5. **Save** the variable.
6. Go to **Deployments** and **Redeploy** the latest commit (or push the change I just made).

## 🚀 Deploy Changes
Run these commands to push the timeout fix and trigger a deployment:

```bash
git add vercel.json
git commit -m "Increase function timeout to 60s for DB cold starts"
git push origin main
```
