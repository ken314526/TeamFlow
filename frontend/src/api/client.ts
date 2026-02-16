import axios from 'axios';
import { store } from '@/store';
import { logout, setTokens } from '@/store/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const normalizeData = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(normalizeData);
  }
  
  if (typeof data === 'object') {
    const normalized: any = {};
    for (const key in data) {
      if (key === '_id') {
        normalized.id = data[key];
      } else if (typeof data[key] === 'object') {
        normalized[key] = normalizeData(data[key]);
      } else {
        normalized[key] = data[key];
      }
    }
    return normalized;
  }
  
  return data;
};

client.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
          const normalizedData = normalizeData(data);
          store.dispatch(setTokens({ token: normalizedData.token, refreshToken: normalizedData.refreshToken }));
          originalRequest.headers.Authorization = `Bearer ${normalizedData.token}`;
          return client(originalRequest);
        } catch {
          store.dispatch(logout());
        }
      } else {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default client;
