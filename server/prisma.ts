import { PrismaClient } from '@prisma/client'

// Serverless-optimized Prisma client with connection pooling
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// Graceful shutdown for serverless
if (process.env.VERCEL) {
    // Set connection pool timeout for Vercel
    prisma.$connect().catch((err) => {
        console.error('Failed to connect to database:', err)
    })
}

export default prisma
