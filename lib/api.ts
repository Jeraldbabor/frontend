import axios from "axios";

/**
 * Axios instance pre-configured for the Laravel backend API.
 *
 * - baseURL: Points to the Laravel backend.
 * - Authorization header: Automatically attaches the Bearer token
 *   from localStorage (if available) on every request.
 * - withCredentials: Enables cookie-based CSRF for Sanctum SPA auth.
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor: handle 401 (unauthenticated) errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stored token and redirect to login
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "/potal-campuseye3x101";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
