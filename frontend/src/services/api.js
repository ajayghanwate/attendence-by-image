import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if the backend requires Bearer tokens
        // For this specific backend, it seems to rely on session cookies or form data for login
        // If Supabase session handling is needed, we'll add the access_token header here
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors
        const message = error.response?.data?.detail || error.message || 'Something went wrong';

        // Don't show toast for 401/403 as we might handle it in UI redirect
        if (error.response?.status !== 401) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
