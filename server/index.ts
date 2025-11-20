import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
import prisma from './prisma.js'
import { Polar } from '@polar-sh/sdk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendFile } from 'node:fs/promises'
import { Webhook } from 'standardwebhooks'
import { PolarError } from '@polar-sh/sdk/models/errors/polarerror.js'

config()

export const app = new Hono()

// Configure CORS for production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://recruit-box.vercel.app',
    'https://recruit-box.netlify.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.PRODUCTION_URL || '',
].filter(Boolean)

app.use('/*', cors({
    origin: (origin) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return '*'

        // Check if origin is in allowed list or is a vercel deployment
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return origin
        }

        return allowedOrigins[0] || '*'
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'webhook-signature', 'webhook-id', 'webhook-timestamp'],
}))

// Handle path resolution for both development and production
let WEBHOOK_SIGNATURE_LOG: string;

if (process.env.NETLIFY) {
  // In Netlify environment, use /tmp for writeable storage
  WEBHOOK_SIGNATURE_LOG = '/tmp/webhook-signatures.log';
} else if (import.meta.url) {
  // In development, use the local file system
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  WEBHOOK_SIGNATURE_LOG = path.join(__dirname, 'webhook-signatures.log');
} else {
    // Fallback for other environments
    WEBHOOK_SIGNATURE_LOG = '/tmp/webhook-signatures.log';
}

const PLAN_TIERS = ['starter', 'agency'] as const
type PlanTier = typeof PLAN_TIERS[number]

const isPlanTier = (value: string): value is PlanTier =>
    PLAN_TIERS.includes(value as PlanTier)

const resolvePolarEnvironment = (): 'sandbox' | 'production' =>
    process.env.POLAR_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production'

const requiredPolarEnvVars = ['POLAR_ACCESS_TOKEN', 'POLAR_STARTER_PRODUCT_ID', 'POLAR_AGENCY_PRODUCT_ID'] as const
const missingPolarEnvVars = requiredPolarEnvVars.filter((key) => !process.env[key])

if (missingPolarEnvVars.length > 0) {
    console.warn('[Config] Missing Polar environment variables:', missingPolarEnvVars)
}

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN

if (!polarAccessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured. Unable to start API server.')
}

const PRODUCT_CONFIG: Record<PlanTier, { productId?: string }> = {
    starter: {
        productId: process.env.POLAR_STARTER_PRODUCT_ID,
    },
    agency: {
        productId: process.env.POLAR_AGENCY_PRODUCT_ID,
    },
}

const CHECKOUT_FAILURE_STATUSES = new Set(['failed', 'expired', 'canceled'])

const polar = new Polar({
    accessToken: polarAccessToken,
    server: resolvePolarEnvironment(),
})

const resolveRequestOrigin = (c: Context): string => {
    const headerOrigin = c.req.header('origin')
    if (headerOrigin) return headerOrigin

    try {
        return new URL(c.req.url).origin
    } catch (error) {
        console.warn('[Request] Failed to resolve URL origin, falling back to PRODUCTION_URL', error)
        return process.env.PRODUCTION_URL || allowedOrigins[0] || 'https://recruit-box.netlify.app'
    }
}

app.post('/api/customer-portal/session', async (c) => {
    const { clerkId, email: requestEmail, name: requestName } = await c.req.json()

    if (!clerkId) {
        return c.json({ error: 'Missing clerkId' }, 400)
    }

    const origin = resolveRequestOrigin(c)

    let user: { email: string; name: string | null; clerkId: string } | null = null

    try {
        user = await prisma.user.findUnique({
            where: { clerkId }
        })
    } catch (error) {
        console.error('[CustomerPortal] Failed to query user from database, continuing with request payload', error)
    }

    const resolvedEmail = user?.email ?? requestEmail
    const resolvedName = user?.name ?? requestName

    if (!resolvedEmail) {
        console.warn('[CustomerPortal] Email missing for portal session provisioning', { clerkId })
        return c.json({ error: 'Email is required to open the billing portal' }, 400)
    }

    const createPortalSession = async () =>
        polar.customerSessions.create({
            externalCustomerId: clerkId,
            returnUrl: `${origin}/pricing`,
        })

    const provisionPolarCustomer = async () => {
        try {
            await polar.customers.create({
                email: resolvedEmail,
                externalId: clerkId,
                name: resolvedName ?? undefined,
                metadata: {
                    clerkId,
                },
            })
        } catch (error) {
            if (error instanceof PolarError && error.statusCode === 409) {
                console.info('Polar customer already exists during provisioning', { clerkId })
                return
            }

            throw error
        }
    }

    try {
        const session = await createPortalSession()
        return c.json({ url: session.customerPortalUrl })
    } catch (error) {
        if (error instanceof PolarError && error.statusCode === 404) {
            console.info('Polar customer missing, attempting to create before portal session', { clerkId })

            try {
                await provisionPolarCustomer()
            } catch (createError) {
                console.error('Failed to auto-create Polar customer for portal session', createError)
                return c.json({
                    error: 'Unable to provision billing profile',
                    detail: createError instanceof Error ? createError.message : 'Unknown error while creating customer',
                }, 500)
            }

            try {
                const session = await createPortalSession()
                return c.json({ url: session.customerPortalUrl })
            } catch (sessionError) {
                console.error('Failed to create customer portal session after provisioning', sessionError)
                if (sessionError instanceof Error) {
                    return c.json({ error: 'Failed to start customer portal session', detail: sessionError.message }, 500)
                }

                return c.json({ error: 'Failed to start customer portal session', detail: 'Unknown error' }, 500)
            }
        }

        console.error('Failed to create customer portal session', error)
        if (error instanceof Error) {
            return c.json({ error: 'Failed to start customer portal session', detail: error.message }, 500)
        }

        return c.json({ error: 'Failed to start customer portal session', detail: 'Unknown error' }, 500)
    }
})

app.get('/', (c) => {
    return c.text('RecruitBox API is running!')
})

// Health check endpoint for debugging production issues
app.get('/api/health', (c) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
            nodeEnv: process.env.NODE_ENV || 'production',
            hasDatabase: !!process.env.DATABASE_URL,
            hasClerkPublic: !!process.env.VITE_CLERK_PUBLISHABLE_KEY,
            hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
            hasPolarToken: !!process.env.POLAR_ACCESS_TOKEN,
            hasPolarWebhookSecret: !!process.env.POLAR_WEBHOOK_SECRET,
            hasStarterProduct: !!process.env.POLAR_STARTER_PRODUCT_ID,
            hasAgencyProduct: !!process.env.POLAR_AGENCY_PRODUCT_ID,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
        },
        products: {
            starter: process.env.POLAR_STARTER_PRODUCT_ID ? 'configured' : 'missing',
            agency: process.env.POLAR_AGENCY_PRODUCT_ID ? 'configured' : 'missing',
        }
    }

    return c.json(health)
})

// Get user subscription status
app.get('/api/subscription/:clerkId', async (c) => {
    const clerkId = c.req.param('clerkId')

    const user = await prisma.user.findUnique({
        where: { clerkId },
        include: { subscription: true }
    })

    if (!user) {
        return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ subscription: user.subscription })
})

// Create or update user (can be called from frontend after login or via Clerk webhook)
app.post('/api/users', async (c) => {
    const { clerkId, email, name } = await c.req.json()

    try {
        const user = await prisma.user.upsert({
            where: { clerkId },
            update: { email, name },
            create: { clerkId, email, name }
        })
        return c.json(user)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Failed to sync user' }, 500)
    }
})

// Create Polar Checkout Session
app.post('/api/checkout', async (c) => {
    const { tier = 'agency', email, clerkId } = await c.req.json()
    console.log('[Checkout] Received request:', { tier, email, clerkId, timestamp: new Date().toISOString() });

    if (!email || !clerkId) {
        console.error('[Checkout] Missing required fields:', { email: !!email, clerkId: !!clerkId });
        return c.json({ error: 'Missing required fields' }, 400)
    }

    // Validate Polar configuration
    if (!process.env.POLAR_ACCESS_TOKEN) {
        console.error('[Checkout] POLAR_ACCESS_TOKEN not configured');
        return c.json({ error: 'Payment system not configured', detail: 'Missing access token' }, 500)
    }

    // Check if user already has an active subscription
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: { subscription: true }
        })

        if (user?.subscription?.status === 'active') {
            console.log('[Checkout] User already has active subscription:', { clerkId });
            return c.json({
                error: 'User already has an active subscription',
                code: 'ALREADY_SUBSCRIBED'
            }, 400)
        }
    } catch (dbError) {
        console.error('[Checkout] Database error checking subscription:', dbError);
        // Continue anyway - don't block checkout on DB issues
    }

    const resolvedTier: PlanTier = typeof tier === 'string' && isPlanTier(tier) ? tier : 'agency'
    const tierConfig = PRODUCT_CONFIG[resolvedTier]
    const productId = tierConfig?.productId

    console.log('[Checkout] Resolved tier config:', {
        resolvedTier,
        productId,
        hasProductId: !!productId,
        envVars: {
            POLAR_STARTER_PRODUCT_ID: !!process.env.POLAR_STARTER_PRODUCT_ID,
            POLAR_AGENCY_PRODUCT_ID: !!process.env.POLAR_AGENCY_PRODUCT_ID,
        }
    });

    if (!productId) {
        console.error(`[Checkout] No product configured for tier ${resolvedTier}`);
        return c.json({
            error: `No product configured for tier ${resolvedTier}`,
            detail: 'Please contact support'
        }, 400)
    }

    try {
        // Create checkout session using Polar SDK
        const origin = c.req.header('origin') || c.req.header('referer')?.split('/').slice(0, 3).join('/') || process.env.PRODUCTION_URL
        console.log('[Checkout] Using origin:', origin);

        // DEBUG: Log the origin and related headers
        console.log('[Checkout Debug] Headers:', {
            origin: c.req.header('origin'),
            referer: c.req.header('referer'),
            productionUrl: process.env.PRODUCTION_URL,
            finalOrigin: origin,
        });

        const checkoutParams = {
            products: [productId],
            customerEmail: email,
            externalCustomerId: clerkId,
            successUrl: `${origin}/?checkout=success`,
            returnUrl: `${origin}/`,
            metadata: {
                userId: clerkId,
                tier: resolvedTier,
            },
            customerMetadata: {
                clerkId,
                tier: resolvedTier,
            },
        };

        console.log('[Checkout] Creating checkout with params:', {
            ...checkoutParams,
            products: checkoutParams.products,
            customerEmail: checkoutParams.customerEmail,
        });

        const checkout = await polar.checkouts.create(checkoutParams)

        console.log('[Checkout] Successfully created checkout:', {
            checkoutId: checkout.id,
            url: checkout.url
        });

        return c.json({ url: checkout.url })
    } catch (error) {
        console.error('[Checkout] Failed to create checkout via Polar SDK:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof Error) {
            return c.json({
                error: 'Failed to create checkout session',
                detail: error.message,
                timestamp: new Date().toISOString()
            }, 500)
        }

        return c.json({
            error: 'Failed to create checkout session',
            detail: 'Unknown error',
            timestamp: new Date().toISOString()
        }, 500)
    }
})

// Polar Webhook
app.post('/api/webhooks/polar', async (c) => {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
    if (!webhookSecret) {
        return c.json({ error: 'No webhook secret configured' }, 500)
    }

    const signatureHeader = c.req.header('webhook-signature')
    const webhookIdHeader = c.req.header('webhook-id')
    const timestampHeader = c.req.header('webhook-timestamp')

    if (!signatureHeader || !webhookIdHeader || !timestampHeader) {
        return c.json({ error: 'Missing webhook signature headers' }, 400)
    }

    const rawBody = await c.req.text()
    const verifier = new Webhook(Buffer.from(webhookSecret, 'utf8').toString('base64'))

    try {
        verifier.verify(rawBody, {
            'webhook-id': webhookIdHeader,
            'webhook-timestamp': timestampHeader,
            'webhook-signature': signatureHeader,
        })
    } catch (error) {
        console.error('Invalid Polar webhook signature', error)
        return c.json({ error: 'Invalid webhook signature' }, 401)
    }

    let body: any
    try {
        body = JSON.parse(rawBody)
    } catch (error) {
        console.error('Invalid Polar webhook payload', error)
        return c.json({ error: 'Invalid JSON payload' }, 400)
    }

    const event = body?.type
    const data = body?.data

    await persistSignatureLog({
        event,
        signature: signatureHeader,
        webhookId: webhookIdHeader,
        timestamp: timestampHeader,
    })

    console.log('Received Polar Webhook:', event)

    if (!event || !data) {
        return c.json({ received: true })
    }

    try {
        switch (event) {
            case 'checkout.updated':
                await handleCheckoutUpdatedEvent(data)
                break
            case 'subscription.created':
            case 'subscription.updated':
                await handleSubscriptionEvent(data)
                break
            case 'subscription.cancelled':
                await handleSubscriptionCancelledEvent(data)
                break
            default:
                break
        }
    } catch (error) {
        console.error(`Failed to process Polar webhook: ${event}`, error)
        return c.json({ error: 'Failed to process webhook' }, 500)
    }

    return c.json({ received: true })
})

const parsePolarDate = (value?: string | null) => (value ? new Date(value) : null)

const resolveClerkId = (payload: any): string | undefined =>
    payload?.metadata?.userId ??
    payload?.metadata?.clerkId ??
    payload?.customer?.external_id ??
    payload?.customer?.metadata?.clerkId

const persistSignatureLog = async (entry: { event?: string; signature: string; webhookId: string; timestamp: string }) => {
    try {
        await appendFile(
            WEBHOOK_SIGNATURE_LOG,
            `${JSON.stringify({ ...entry, receivedAt: new Date().toISOString() })}\n`
        )
    } catch (error) {
        console.error('Failed to persist webhook signature', error)
    }
}

const syncSubscriptionRecord = async (clerkId: string, subscriptionData: any) => {
    if (!subscriptionData?.id) {
        console.warn('Subscription payload missing id, skipping sync')
        return
    }

    try {
        await prisma.subscription.upsert({
            where: { polarId: subscriptionData.id },
            update: {
                status: subscriptionData.status,
                currentPeriodEnd: parsePolarDate(subscriptionData.current_period_end),
            },
            create: {
                polarId: subscriptionData.id,
                status: subscriptionData.status,
                currentPeriodEnd: parsePolarDate(subscriptionData.current_period_end),
                user: {
                    connect: { clerkId },
                },
            },
        })
    } catch (error) {
        console.error('Failed to sync subscription record', error)
    }
}

const deleteSubscriptionForUser = async (clerkId: string) => {
    try {
        await prisma.subscription.deleteMany({
            where: {
                user: {
                    clerkId,
                },
            },
        })
    } catch (error) {
        console.error('Failed to delete subscription for user', error)
    }
}

const handleCheckoutUpdatedEvent = async (data: any) => {
    const clerkId = resolveClerkId(data)

    if (!clerkId) {
        console.warn('checkout.updated missing clerkId metadata')
        return
    }

    if (data.status === 'succeeded') {
        const subscriptionId = data.subscription?.id

        if (!subscriptionId) {
            console.warn('checkout.updated missing subscription reference')
            return
        }

        try {
            const subscription = await polar.subscriptions.get({ id: subscriptionId })
            await syncSubscriptionRecord(clerkId, subscription)
        } catch (error) {
            console.error('Failed to fetch subscription after checkout success', error)
        }

        return
    }

    if (CHECKOUT_FAILURE_STATUSES.has(data.status)) {
        await deleteSubscriptionForUser(clerkId)
    }
}

const handleSubscriptionEvent = async (data: any) => {
    const clerkId = resolveClerkId(data)

    if (!clerkId) {
        console.warn('Subscription event missing clerkId metadata')
        return
    }

    await syncSubscriptionRecord(clerkId, data)
}

const handleSubscriptionCancelledEvent = async (data: any) => {
    const clerkId = resolveClerkId(data)

    if (!clerkId) {
        console.warn('Subscription cancelled event missing clerkId metadata')
        return
    }

    await syncSubscriptionRecord(clerkId, data)
}

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
