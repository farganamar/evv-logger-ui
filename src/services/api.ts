import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const tokens = localStorage.getItem('auth_tokens');
    
    if (tokens) {
      const { access_token } = JSON.parse(tokens);
      config.headers = {
        ...config.headers,
        Authorization: access_token,
      };
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you would implement refresh token logic
      // For now, we'll just log out the user
      localStorage.removeItem('auth_tokens');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;