import axios from 'axios';

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartlib_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not already on /login, redirect
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('smartlib_token');
        localStorage.removeItem('smartlib_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to download authenticated binary/csv files cleanly via Axios
 */
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  const token = localStorage.getItem('smartlib_token');
  const targetPath = url.startsWith('/api') ? url : `/api${url}`;
  const fullUrl = apiBase ? `${apiBase}${targetPath}` : targetPath;
  const response = await axios.get(fullUrl, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const contentType = (response.headers['content-type'] as string) || 'text/csv;charset=utf-8;';
  const blob = new Blob([response.data], {
    type: contentType,
  });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export default api;
