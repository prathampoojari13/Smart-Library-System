import axios from "axios";

export const PRODUCTION_API_URL = "https://smart-library-backend-pbl6.onrender.com";
export const LOCAL_API_URL = "http://localhost:8000";

/**
 * Dynamically resolves the API Base URL.
 * - If running locally (localhost, 127.0.0.1, or Vite DEV mode), connects to local backend.
 * - If running on a deployed production domain (Render, Vercel, etc.), connects to the production backend.
 * - Respects explicit remote VITE_API_BASE_URL overrides.
 */
export const getApiBaseUrl = () => {
    const isBrowser = typeof window !== "undefined" && window.location;
    const hostname = isBrowser ? window.location.hostname : "";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

    const envUrl = import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, "")
        : "";

    // 1. Local development environment check
    if (isLocalhost || import.meta.env.DEV) {
        if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
            return envUrl;
        }
        return isBrowser && hostname ? `http://${hostname}:8000` : LOCAL_API_URL;
    }

    // 2. Explicit remote production URL in environment variables
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl;
    }

    // 3. Fallback for deployed production environments
    return PRODUCTION_API_URL;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach JWT & log request details
api.interceptors.request.use(
    (config) => {
        // Guarantee baseURL is current on each request
        config.baseURL = getApiBaseUrl();

        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const fullUrl = (config.baseURL || "").replace(/\/+$/, "") + "/" + (config.url || "").replace(/^\/+/, "");
        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`, {
            baseURL: config.baseURL,
            endpoint: config.url,
            hasAuthToken: Boolean(token),
        });

        return config;
    },
    (error) => {
        console.error("[API REQUEST ERROR]", error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Log responses & errors
api.interceptors.response.use(
    (response) => {
        console.log(`[API RESPONSE ${response.status}] ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        const fullUrl = (error.config?.baseURL || "").replace(/\/+$/, "") + "/" + (error.config?.url || "").replace(/^\/+/, "");
        console.error(`[API ERROR ${error.response?.status || "NETWORK_ERROR"}] ${fullUrl}`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
        });
        return Promise.reject(error);
    }
);

export default api;
