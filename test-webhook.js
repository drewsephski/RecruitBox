import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:3001/api/webhooks/polar';
const SECRET = 'polar_wh_YOUR_SECRET'; // Must match .env

const payload = {
    type: 'subscription.created',
    data: {
        id: 'sub_123',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
            userId: 'user_2t...' // Replace with a real Clerk ID from your DB if testing E2E, or mock it
        }
    }
};

async function testWebhook() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'polar-webhook-signature': '...' // Add signature if verification is enabled
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response:', response.status, data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testWebhook();
