import axios from 'axios';
import config from './config';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            headers: error.config?.headers
        });
        return Promise.reject(error);
    }
);

export default axiosInstance; 