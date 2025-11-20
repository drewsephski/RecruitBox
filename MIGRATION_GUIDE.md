# Migrating from SQLite to PostgreSQL for Vercel Deployment

## ⚠️ Critical Warning

**SQLite does NOT work on Vercel Serverless Functions.**
Vercel's filesystem is ephemeral and read-only. If you deploy with SQLite:
1. **Data Loss**: Your database will be reset on every deployment and potentially every function invocation.
2. **Read-Only Errors**: You will likely encounter "Read-only file system" errors when trying to write data.
3. **Timeouts**: The application may hang or timeout (504 errors) when trying to access the database file.

To fix the "User sync timeout" and "504 Gateway Timeout" errors in production, you **MUST** migrate to a cloud database like **PostgreSQL** (e.g., Neon, Supabase, Vercel Postgres).

## Migration Steps

### 1. Get a PostgreSQL Database
- **Vercel Postgres**: Go to Vercel Dashboard > Storage > Create > Postgres.
- **Neon**: Create a free project at [neon.tech](https://neon.tech).
- **Supabase**: Create a free project at [supabase.com](https://supabase.com).

### 2. Update Environment Variables
Get your connection string (e.g., `postgres://user:pass@host:5432/db`) and update your `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### 3. Update Prisma Schema
Modify `prisma/schema.prisma` to use `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Regenerate Prisma Client
Run the following commands to update your client:

```bash
# Install Prisma Client for Postgres
bun install

# Generate the client
bun x prisma generate

# Push the schema to the new database
bun x prisma db push
```

### 5. Update Vercel Environment Variables
1. Go to your Vercel Project Settings > Environment Variables.
2. Add/Update `DATABASE_URL` with your production PostgreSQL connection string.

### 6. Redeploy
Commit your changes and push to GitHub to trigger a new deployment.

```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push origin main
```

## Why this fixes the errors
- **Timeouts**: Cloud databases are optimized for concurrent connections.
- **Persistence**: Data is stored safely outside the ephemeral Vercel environment.
- **Scalability**: Postgres handles multiple users much better than a file-based DB.

## Local Development
If you want to keep using SQLite locally but Postgres in production, you can use two schema files, but it's **recommended to use Postgres locally too** (via Docker or the same cloud DB) to ensure parity.
