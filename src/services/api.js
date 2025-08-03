import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);

        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            let message = data?.detail || data?.message || 'An error occurred';

            switch (status) {
                case 400:
                    message = `Bad Request: ${message}`;
                    break;
                case 401:
                    message = 'Unauthorized access';
                    break;
                case 403:
                    message = 'Access forbidden';
                    break;
                case 404:
                    message = 'Resource not found';
                    break;
                case 429:
                    message = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    message = 'Internal server error. Please try again.';
                    break;
                default:
                    message = `Server error (${status}): ${message}`;
            }

            throw new Error(message);
        } else if (error.request) {
            // Request made but no response received
            throw new Error('Unable to connect to server. Please check your connection.');
        } else {
            // Something else happened
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
);

// API methods
export const apiService = {
    // Upload PDF file
    uploadPDF: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Progress tracking
            onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                console.log(`📤 Upload progress: ${progress}%`);
            },
        });

        return response.data;
    },

    // Send chat message
    sendMessage: async (message, sessionId) => {
        const response = await api.post('/chat', {
            message,
            session_id: sessionId,
        });

        return response.data;
    },

    // Get chat history
    getChatHistory: async (sessionId) => {
        const response = await api.get(`/chat/history/${sessionId}`);
        return response.data;
    },

    // Health check
    healthCheck: async () => {
        const response = await api.get('/health');
        return response.data;
    },

    // Get session info
    getSessionInfo: async (sessionId) => {
        const response = await api.get(`/session/${sessionId}`);
        return response.data;
    },
};

// Utility functions for error handling
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);

    if (error.message) {
        return error.message;
    }

    return defaultMessage;
};

// Check if backend is available
export const checkBackendHealth = async () => {
    try {
        await apiService.healthCheck();
        return { available: true, message: 'Backend is healthy' };
    } catch (error) {
        return {
            available: false,
            message: handleApiError(error, 'Backend is not available')
        };
    }
};

export default api;