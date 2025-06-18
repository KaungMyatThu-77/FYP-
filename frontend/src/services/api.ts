import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

const processQueue = (error: any | null, token: string | null = null) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor to handle unauthorized errors (e.g., token expiry)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is a 401 and not a retry attempt
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried

            const errorMessage = error.response.data?.message;
            const refreshToken = localStorage.getItem('refresh_token');

            // Case 1: Token revoked or signature failed, attempt refresh
            if ((errorMessage === "Token has been revoked." || errorMessage === "Signature verification failed.") && refreshToken) {
                if (isRefreshing) {
                    // If a refresh is already in progress, queue the original request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                isRefreshing = true;

                try {
                    // Use a direct axios call to avoid re-triggering this interceptor
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`
                        }
                    });

                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);
                    isRefreshing = false;
                    processQueue(null, access_token); // Resolve all queued requests

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest); // Retry the original request
                } catch (refreshError: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                    isRefreshing = false;
                    processQueue(refreshError, null); // Reject all queued requests

                    console.error('Refresh token failed or invalid. Clearing tokens and redirecting to login.', refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login'; // Redirect to login page
                    return Promise.reject(refreshError);
                }
            } else {
                // Case 2: Other 401 errors (e.g., invalid credentials, account locked, or no refresh token)
                console.error('Unauthorized error:', errorMessage || 'Token expired or invalid. Redirecting to login...');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login'; // Redirect to login page
            }
        } else if (error.response && error.response.status === 403) {
            console.error('Forbidden: You do not have permission to access this resource.', error.response.data?.message);
            // Optionally, show a user-friendly message or redirect to an access denied page
        } else if (error.response && error.response.status === 404) {
            console.error('Not Found:', error.response.data?.message);
            // Optionally, show a user-friendly message
        } else if (error.response && error.response.status === 500) {
            console.error('Internal Server Error:', error.response.data?.message);
            // Optionally, show a generic error message to the user
        }

        return Promise.reject(error);
    }
);

export default api;
