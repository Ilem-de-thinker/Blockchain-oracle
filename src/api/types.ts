export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginatedResponseWithItems<T> {
  count: number;
  next: string | null;
  previous: string | null;
  items: T[];
}

export interface PaginatedResponseWithUnreadCount<T> {
  count: number;
  next: string | null;
  previous: string | null;
  unread_count: number;
  results: T[];
}

export interface ApiError {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: string[] | string | undefined;
}

export interface SuccessMessage {
  message: string;
}

export interface CountMessage {
  marked_count?: number;
  deleted_count?: number;
  message: string;
}
