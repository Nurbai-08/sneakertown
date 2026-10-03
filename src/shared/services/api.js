import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

const applySession = (data) => {
  setAccessToken(data?.access_token);
  return data;
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = publicApi
      .post('/auth/refresh')
      .then(({ data }) => applySession(data))
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status === 401 && request && !request._retried) {
      request._retried = true;
      try {
        const session = await refreshSession();
        request.headers.Authorization = `Bearer ${session.access_token}`;
        return api(request);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error, fallback = 'Произошла ошибка. Попробуйте позже') => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg.replace(/^Value error, /, '');
  if (error?.code === 'ERR_NETWORK') return 'Сервер недоступен. Попробуйте позже';
  return fallback;
};

export const authApi = {
  async register({ email, password, displayName }) {
    const { data } = await publicApi.post('/auth/register', {
      email,
      password,
      display_name: displayName,
    });
    return applySession(data);
  },
  async login(credentials) {
    const { data } = await publicApi.post('/auth/login', credentials);
    return applySession(data);
  },
  refresh: refreshSession,
  async logout() {
    try {
      await publicApi.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },
  async forgotPassword(email) {
    const { data } = await publicApi.post('/auth/forgot-password', { email });
    return data;
  },
  async resetPassword(token, password) {
    const { data } = await publicApi.post('/auth/reset-password', { token, password });
    return data;
  },
  getGoogleLoginUrl() {
    if (/^https?:\/\//.test(API_BASE_URL)) return `${API_BASE_URL.replace(/\/$/, '')}/auth/google/start`;
    return `${window.location.origin}${API_BASE_URL.replace(/\/$/, '')}/auth/google/start`;
  },
};
