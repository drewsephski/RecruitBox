// API configuration for production and development
const getApiBaseUrl = (): string => {
    // In production (Vercel), API routes are served from the same domain
    // In development, we use the proxy configured in vite.config.ts
    if (typeof window === 'undefined') {
        return ''; // Server-side rendering
    }

    // Check if we're in production (Vercel)
    if (window.location.hostname.includes('vercel.app') ||
        import.meta.env.PROD) {
        return ''; // Same domain, use relative URLs
    }

    // Development - use relative URLs (Vite proxy handles it)
    return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to make API calls with better error handling
export async function apiCall<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`[API] Calling ${endpoint}`, {
        url,
        method: options.method || 'GET',
        hasBody: !!options.body,
    });

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        console.log(`[API] Response from ${endpoint}:`, {
            status: response.status,
            ok: response.ok,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API] Error from ${endpoint}:`, errorData);
            throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(`[API] Success from ${endpoint}`, data);
        return data;
    } catch (error) {
        console.error(`[API] Failed to call ${endpoint}:`, error);
        throw error;
    }
}
