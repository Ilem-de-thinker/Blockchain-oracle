export enum UserRole {
  LEARNER = 'learner',
  ENTERPRISE = 'enterprise',
  INSTRUCTOR = 'instructor',
  INFLUENCER = 'influencer',
  CONTRIBUTOR = 'contributor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  is_verified?: boolean;
}

export type LessonType = 'video' | 'text' | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: LessonType;
  content?: string; // Markdown or HTML for text lessons
  videoUrl?: string;
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  enrollmentCount: number;
  modules: CourseModule[];
  category: string;
}

// API Course types (matches backend response)
export interface ApiCourseMaterial {
  id: number;
  course: number;
  module?: number;
  type: 'video' | 'pdf' | 'text';
  title: string;
  order: number;
  url?: string;
  duration?: number;
  pages?: number;
  content?: string;
  is_completed?: boolean;
  created_at: string;
}

export interface ApiModuleQuizSummary {
  id: number;
  title: string;
  description?: string;
}

export interface ApiCourseModule {
  id: number;
  course: number;
  title: string;
  description?: string;
  order: number;
  quiz_id?: number | null;
  quizzes?: ApiModuleQuizSummary[];
  is_published: boolean;
  materials?: ApiCourseMaterial[];
  is_completed?: boolean;
  completion_stats?: {
    total: number;
    completed: number;
    percentage: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiCourse {
  id: number;
  title: string;
  description: string;
  thumbnail_url?: string;
  certificate_template?: string;
  registration_fee?: string;
  tuition_fee?: string;
  certificate_fee?: string;
  total_amount?: string;
  allow_installments?: boolean;
  price?: string;
  category?: string;
  level?: string;
  is_published: boolean;
  tutor: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    tutor_rating?: number;
    student_rating?: number;
    phone_number?: string;
    address?: string;
    lga?: string;
    state?: string;
    country?: string;
    bio?: string;
    profile_picture?: string;
    active_referral_code?: string;
    referred_by?: string;
    user_category?: string;
    onboarding_fee?: boolean;
  };
  modules: ApiCourseModule[];
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  user: number;
  course: ApiCourse;
  enrolled_at: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export interface Certificate {
  id: number;
  user: number;
  course: ApiCourse;
  certificate_url: string;
  issued_at: string;
  grade?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'Webinar' | 'In-person' | 'Workshop';
  price: number;
  location?: string;
  thumbnail: string;
  isPaid: boolean;
}

export interface ConsultingTicket {
  id: string;
  companyName: string;
  status: 'Pending' | 'Active' | 'Completed';
  requestType: string;
  createdAt: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  thumbnail: string;
}
