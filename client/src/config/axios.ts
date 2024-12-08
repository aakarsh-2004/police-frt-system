import axios from 'axios';
import config from './config';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request headers:', {
                ...config.headers,
                Authorization: `Bearer ${token}`
            });
        } else {
            console.log('No token found or headers undefined');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
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