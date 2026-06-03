import axios, { AxiosError } from 'axios';

export type ErrorFormat =
  | 'field_validation'
  | 'detail'
  | 'custom_error'
  | 'message'
  | 'array'
  | 'unknown';

export interface ParsedError {
  message: string;
  details?: string[];
  fieldErrors?: Record<string, string[]>;
  statusCode?: number;
  format: ErrorFormat;
  isNetworkError: boolean;
}

export function parseApiError(error: unknown): ParsedError {
  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      format: 'unknown',
      isNetworkError: false,
    };
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data as Record<string, unknown> | string[] | undefined;

  if (!axiosError.response) {
    return {
      message: 'Network error. Please check your connection.',
      format: 'unknown',
      isNetworkError: true,
      statusCode: status,
    };
  }

  if (status === 401) {
    return {
      message: 'Authentication required. Please log in again.',
      format: 'detail',
      isNetworkError: false,
      statusCode: status,
    };
  }

  if (status === 403) {
    return {
      message: 'You do not have permission to perform this action.',
      format: 'detail',
      isNetworkError: false,
      statusCode: status,
    };
  }

  if (status === 404) {
    return {
      message: 'The requested resource was not found.',
      format: 'detail',
      isNetworkError: false,
      statusCode: status,
    };
  }

  if (status === 409) {
    return {
      message: 'This resource already exists or conflicts with existing data.',
      format: 'detail',
      isNetworkError: false,
      statusCode: status,
    };
  }

  if (status === 422) {
    return {
      message: 'The request could not be processed.',
      format: 'detail',
      isNetworkError: false,
      statusCode: status,
    };
  }

  if (status === 500 || (status && status >= 500)) {
    return {
      message: 'Server error. Please try again later.',
      format: 'detail',
      isNetworkError: false,
      statusCode: status,
    };
  }

  if (!data) {
    return {
      message: 'An unexpected error occurred.',
      format: 'unknown',
      isNetworkError: false,
      statusCode: status,
    };
  }

  // Format 1: { field: ["error message"] } - Django REST Framework validation
  if (typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data);
    const firstKey = keys[0];
    const firstValue = data[firstKey];

    if (firstKey && Array.isArray(firstValue)) {
      const fieldErrors = data as Record<string, string[]>;
      const allMessages = Object.values(fieldErrors).flat();
      return {
        message: allMessages[0] || 'Validation failed.',
        details: allMessages,
        fieldErrors,
        format: 'field_validation',
        isNetworkError: false,
        statusCode: status,
      };
    }

    if (firstKey === 'detail' && typeof firstValue === 'string') {
      return {
        message: firstValue,
        format: 'detail',
        isNetworkError: false,
        statusCode: status,
      };
    }

    if (firstKey === 'error' && typeof firstValue === 'string') {
      return {
        message: firstValue,
        format: 'custom_error',
        isNetworkError: false,
        statusCode: status,
      };
    }

    if (firstKey === 'message' && typeof firstValue === 'string') {
      return {
        message: firstValue,
        format: 'message',
        isNetworkError: false,
        statusCode: status,
      };
    }
  }

  // Format 2: ["error in array"]
  if (Array.isArray(data) && typeof data[0] === 'string') {
    return {
      message: data[0],
      details: data,
      format: 'array',
      isNetworkError: false,
      statusCode: status,
    };
  }

  return {
    message: 'An unexpected error occurred.',
    format: 'unknown',
    isNetworkError: false,
    statusCode: status,
  };
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

export function getFieldErrors(error: unknown): Record<string, string[]> | undefined {
  const parsed = parseApiError(error);
  return parsed.fieldErrors;
}

export function isNetworkError(error: unknown): boolean {
  return parseApiError(error).isNetworkError;
}

export function getErrorToastVariant(statusCode?: number): 'destructive' | 'warning' | 'default' {
  if (!statusCode) return 'destructive';
  if (statusCode >= 500) return 'destructive';
  if (statusCode >= 400 && statusCode < 500) return 'warning';
  return 'default';
}
