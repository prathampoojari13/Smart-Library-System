import axios from "axios";

const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
    }
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return `http://${hostname}:8000`;
        }
    }
    return "http://127.0.0.1:8000";
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
