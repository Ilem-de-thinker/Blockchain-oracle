export interface RouteConfig {
  path: string;
  component: any;
  children?: RouteConfig[];
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'active' | 'suspended' | 'pending';
  country?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: string;
  status: 'draft' | 'published' | 'archived';
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  enrollments: number;
  rating: number;
  duration: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  banner: string;
  date: string;
  time: string;
  location: string;
  ticketTypes: TicketType[];
  capacity: number;
  registrations: number;
  status: 'draft' | 'published' | 'cancelled';
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'course' | 'event' | 'consulting' | 'subscription';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
