import axios from "axios";

const PRODUCTION_API_URL = "https://smart-library-backend-pbl6.onrender.com";
const LOCAL_API_URL = "http://localhost:8000";

const getApiBaseUrl = () => {
    // 1. Explicit environment variable takes highest precedence
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
    }

    // 2. Local development environment check (browser hostname or dev mode)
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return `http://${hostname}:8000`;
        }
    }

    if (import.meta.env.DEV) {
        return LOCAL_API_URL;
    }

    // 3. Production fallback for deployed environments
    return PRODUCTION_API_URL;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
