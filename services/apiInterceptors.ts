import { AxiosInstance, AxiosError } from 'axios';

export const setupInterceptors = (api: AxiosInstance) => {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // Log requests in development
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      // Log responses in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Log errors
      console.error('[API Error]', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        message: error.message
      });

      // Handle specific error codes
      if (error.response) {
        const status = error.response.status;
        const data: any = error.response.data;

        switch (status) {
          case 401:
            // Unauthorized - token expired or invalid
            if (!originalRequest._retry) {
              // Could implement token refresh here
              console.warn('Authentication failed. Please login again.');
            }
            break;

          case 403:
            // Forbidden
            console.error('Access forbidden');
            break;

          case 404:
            console.error('Resource not found');
            break;

          case 429:
            // Too many requests - rate limited
            const retryAfter = error.response.headers['retry-after'];
            console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
            break;

          case 500:
          case 502:
          case 503:
            // Server errors - could implement retry logic
            if (!originalRequest._retry && originalRequest._retryCount < 2) {
              originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
              originalRequest._retry = true;
              
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
              return api(originalRequest);
            }
            break;

          default:
            break;
        }

        // Throw structured error
        throw {
          message: data?.message || error.message || 'An error occurred',
          status,
          errors: data?.errors || []
        };
      }

      // Network error or timeout
      if (error.code === 'ECONNABORTED') {
        throw { message: 'Request timeout. Please try again.', status: 0 };
      }

      if (!error.response) {
        throw { message: 'Network error. Please check your connection.', status: 0 };
      }

      return Promise.reject(error);
    }
  );
};

