/// <reference types="bun-types" />
import type { Handler } from '@netlify/functions';
import { app } from '../../server';
import path from 'node:path';

// Set up environment for Netlify Functions
if (process.env.NETLIFY) {
  // Set required environment variables for path resolution
  process.env.PWD = process.env.PWD || "/var/task";
  process.cwd = () => process.env.PWD!;
  
  // Disable file-based configuration for Polar SDK
  process.env.POLAR_DISABLE_FILE_CONFIG = "true";
  
  // Set up path resolution for production
  if (!process.env.PRODUCTION) {
    process.env.PRODUCTION = 'true';
  }
}

// For local development with Bun
if (process.env.NETLIFY_DEV || process.env.NODE_ENV === 'development') {
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
    // Ensure environment variables are set for path resolution
    process.env.PWD = process.env.PWD || "/var/task";
    process.env.POLAR_DISABLE_FILE_CONFIG = "true";
    
    // Convert Netlify event to Hono request
    const headers = new Headers();
    Object.entries(event.headers || {}).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        headers.set(key, value);
      }
    });

    // Create a new URL with the correct path
    const host = event.headers.host || 'localhost:8888'; // Default to localhost:8888 for Netlify Dev
    const path = event.path || '/.netlify/functions/server';
    const queryString = event.queryStringParameters 
      ? `?${new URLSearchParams(event.queryStringParameters as Record<string, string>).toString()}` 
      : '';
      
    const url = new URL(
      event.rawUrl || `https://${host}${path}${queryString}`
    );
    
    // Ensure the path is correctly set for API routes
    if (!url.pathname.startsWith('/.netlify/functions/')) {
      url.pathname = `/.netlify/functions/server${path}`;
    }

    // Create a new request object
    const request = new Request(url.toString(), {
      method: event.httpMethod,
      headers,
      body: event.body ? 
        (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body) : 
        null,
    });

    // Handle the request with the Hono app
    const response = await app.fetch(request);

    // Convert the response to the format expected by Netlify
    const responseBody = await response.text();
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
