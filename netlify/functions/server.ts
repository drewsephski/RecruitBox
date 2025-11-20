// netlify/functions/server.ts
import { app } from '../../server';
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    // Ensure environment variables are set for path resolution
    process.env.PWD = process.env.PWD || "/var/task";
    process.env.POLAR_DISABLE_FILE_CONFIG = "true";
    
    // Create a new request object that matches what Hono expects
    const url = new URL(event.rawUrl);
    const request = new Request(url.toString(), {
      method: event.httpMethod,
      headers: new Headers(event.headers as Record<string, string>),
      body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
    });

    // Handle the request with Hono
    const response = await app.fetch(request);

    // Convert the response to the format Netlify expects
    const body = await response.text();
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
