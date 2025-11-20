import type { Handler } from '@netlify/functions';
import { app } from '../../server';

// For local development with Bun
if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 3001;
  console.log(`Starting Bun server on http://localhost:${port}`);
  
  // Start the server with Bun's native HTTP server
  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      // Remove /api prefix for local development
      if (url.pathname.startsWith('/api')) {
        const newUrl = new URL(url.pathname.replace(/^\/api/, ''), url);
        req = new Request(newUrl.toString(), {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
      }
      return app.fetch(req);
    },
  });
}

// For Netlify Functions
export const handler: Handler = async (event) => {
  try {
    // Convert Netlify event to Hono request
    const headers = new Headers();
    Object.entries(event.headers || {}).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        headers.set(key, value);
      }
    });

    // Handle API Gateway v2.0 (Netlify Functions v2)
    let path = event.path || '';
    if (event.rawPath) {
      path = event.rawPath;
    }
    
    // Remove /api prefix if present
    path = path.replace(/^\/api/, '');
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    
    // Create URL with query parameters
    const url = new URL(path, 'http://localhost');
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value as string);
        }
      });
    }

    // Create request with proper body handling
    const request = new Request(url.toString(), {
      method: event.httpMethod,
      headers,
      body: event.body && event.isBase64Encoded 
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : (event.body || null),
    });

    // Handle the request with Hono
    const response = await app.fetch(request);
    
    // Convert Hono response to Netlify response
    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      // Skip content-encoding header as Netlify handles this
      if (key.toLowerCase() !== 'content-encoding') {
        responseHeaders[key] = value;
      }
    });

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
