import axios from 'axios';

interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
  VITE_API_URL?: string;
  DEV?: boolean;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Import interceptors
import { setupInterceptors } from './apiInterceptors';

setupInterceptors(api);

export default api;
