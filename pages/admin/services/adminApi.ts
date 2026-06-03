/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';
import { parseApiError } from '../../../src/api/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '';

class AdminApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        // Support both adminToken and standard access_token
        const token = localStorage.getItem('adminToken') || localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<any>>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          // Don't auto-redirect to /login here as it might break dashboard sessions
          // window.location.href = '/login';
        }

        const errorMessage = parseApiError(error).message || 'An unexpected error occurred';

        return Promise.reject({
          status: error.response?.status,
          message: errorMessage,
          errors: error.response?.data?.errors,
          originalError: error,
        });
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const adminApi = new AdminApiService();

export const adminApiEndpoints = {
  dashboard: {
    stats: () => adminApi.get('/admin/dashboard/stats/'),
    recentActivity: (params?: { limit?: number }) => adminApi.get('/admin/dashboard/activity/', { params }),
    charts: (params?: { period?: string }) => adminApi.get('/admin/dashboard/charts/', { params }),
  },
  users: {
    list: (params?: any) => adminApi.get('/admin/users/', { params }),
    get: (id: string) => adminApi.get(`/admin/users/${id}/`),
    create: (data: any) => adminApi.post('/admin/users/', data),
    update: (id: string, data: any) => adminApi.put(`/admin/users/${id}/`, data),
    delete: (id: string) => adminApi.delete(`/admin/users/${id}/`),
    bulkAction: (action: string, userIds: string[]) => adminApi.post('/admin/users/bulk/', { action, userIds }),
    export: (params?: any) => adminApi.get('/admin/users/export/', { params }),
  },
  courses: {
    list: (params?: any) => adminApi.get('/admin/courses/', { params }),
    get: (id: string) => adminApi.get(`/admin/courses/${id}/`),
    create: (data: any) => adminApi.post('/admin/courses/', data),
    update: (id: string, data: any) => adminApi.put(`/admin/courses/${id}/`, data),
    delete: (id: string) => adminApi.delete(`/admin/courses/${id}/`),
    duplicate: (id: string) => adminApi.post(`/admin/courses/${id}/duplicate/`),
    publish: (id: string) => adminApi.post(`/admin/courses/${id}/publish/`),
    archive: (id: string) => adminApi.post(`/admin/courses/${id}/archive/`),
  },
  categories: {
    list: () => adminApi.get('/admin/categories/'),
    create: (data: any) => adminApi.post('/admin/categories/', data),
    update: (id: string, data: any) => adminApi.put(`/admin/categories/${id}//`),
    delete: (id: string) => adminApi.delete(`/admin/categories/${id}/`),
  },
  events: {
    list: (params?: any) => adminApi.get('/admin/events/', { params }),
    get: (id: string) => adminApi.get(`/admin/events/${id}/`),
    create: (data: any) => adminApi.post('/admin/events/', data),
    update: (id: string, data: any) => adminApi.put(`/admin/events/${id}/`, data),
    delete: (id: string) => adminApi.delete(`/admin/events/${id}/`),
    registrations: (id: string) => adminApi.get(`/admin/events/${id}/registrations/`),
    exportAttendees: (id: string) => adminApi.get(`/admin/events/${id}/attendees/export/`),
  },
  payments: {
    list: (params?: any) => adminApi.get('/admin/payments/', { params }),
    get: (id: string) => adminApi.get(`/admin/payments/${id}/`),
    stats: () => adminApi.get('/admin/payments/stats/'),
  },
  reports: {
    generate: (type: string, params?: any) => adminApi.post(`/admin/reports/${type}/`, params),
    export: (type: string, format: 'csv' | 'pdf', params?: any) =>
      adminApi.get(`/admin/reports/${type}/export/`, { params: { ...params, format } }),
  },
  settings: {
    get: () => adminApi.get('/admin/settings/'),
    update: (data: any) => adminApi.put('/admin/settings/', data),
  },
  logs: {
    list: (params?: any) => adminApi.get('/admin/audit-logs/', { params }),
    export: (params?: any) => adminApi.get('/admin/audit-logs/export/', { params }),
  },
};

export default adminApi;
