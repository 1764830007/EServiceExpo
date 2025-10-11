import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Consts } from '../../constants/config';

// Create axios instance with default config
const api = axios.create({
  baseURL: Consts.Config.BaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = await AsyncStorage.getItem('authToken');
    console.log('Auth Token:', token ? 'Exists' : 'Not found');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Construct full URL
    const fullUrl = `${config.baseURL}${config.url}${
      config.params ? `?${new URLSearchParams(config.params).toString()}` : ''
    }`;

    // Log request details
    console.log('\n🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: fullUrl,
      // headers: config.headers,
      ...(config.data && { body: config.data }),
      ...(config.params && { params: config.params })
    });

    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('\n✅ API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Log error response
    console.log('\n❌ API Error:', {
      url: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${Consts.Config.BaseUrl}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;

        // Store the new token
        await AsyncStorage.setItem('authToken', token);

        // Update the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (error) {
        // Refresh token failed, user needs to login again
        await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
        // You might want to redirect to login here
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;