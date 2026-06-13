import apiClient from './client';

/**
 * STUDENT ANALYTICS
 */

export interface StudentCourseProgress {
    overall_completion: number;
    courses: Array<{
        course_id: number;
        title: string;
        completion: number;
        status: string;
    }>;
    status_counts: {
        completed: number;
        in_progress: number;
        not_started: number;
    };
}

export interface StudentActivity {
    daily: Array<{
        date: string;
        minutes: number;
        materials_completed: number;
    }>;
    total_minutes: number;
}

export interface StudentQuizSummary {
    total_attempts: number;
    passed: number;
    failed: number;
    average_score: number;
}

export interface StudentDashboardSummary {
    overall_completion: number;
    total_courses: number;
    completed_courses: number;
    quizzes_passed: number;
    quizzes_failed: number;
    total_spent: number;
    current_streak_days: number;
    weekly_minutes: number;
}

export interface StudentEnrollmentSummary {
    by_category: Array<{
        category: string;
        count: number;
    }>;
}

export interface StudentSpendingHistory {
    monthly_spending?: Array<{
        month: string;
        total: number;
    }>;
    transactions?: Array<{
        date: string;
        amount: number;
        status: string;
    }>;
}

export interface StudentEventSummary {
    upcoming: number;
    past: number;
    by_month: Array<{
        month: string;
        count: number;
    }>;
}

export interface StudentEnrollmentTimeline {
    monthly_enrollments: Array<{
        month: string;
        count: number;
    }>;
}

/**
 * TUTOR ANALYTICS
 */

export interface TutorDashboard {
    total_courses: number;
    total_enrollments: number;
    avg_course_rating: number;
    monthly_enrollments: Array<{
        month: string;
        count: number;
    }>;
    per_course: Array<{
        course_id: number;
        title: string;
        enrollments: number;
        completion_rate: number;
    }>;
}

export interface TutorQuizStats {
    total_attempts: number;
    passed: number;
    failed: number;
    per_course: Array<{
        course_id: number;
        passed: number;
        failed: number;
    }>;
}

export interface TutorRevenue {
    total_earnings: number;
    pending: number;
    received: number;
    per_course: Array<{
        course_id: number;
        title: string;
        sales: number;
    }>;
    monthly_revenue?: Array<{
        month: string;
        amount: number;
    }>;
}

export interface TutorDashboardSummary {
    total_courses: number;
    total_students: number;
    total_revenue: number;
    avg_rating: number;
    active_students_this_week: number;
    completion_rate: number;
}

export interface TutorEnrollmentFunnel {
    funnel: Array<{
        stage: string;
        count: number;
    }>;
    per_course: Array<{
        course_id: number;
        enrolled: number;
        in_progress: number;
        completed: number;
    }>;
}

export interface TutorRatings {
    per_course: Array<{
        course_id: number;
        title: string;
        avg_rating: number;
        total_reviews: number;
    }>;
}

export interface TutorDropoffAnalysis {
    per_course: Array<{
        course_id: number;
        modules: Array<{
            module_id: number;
            title: string;
            started: number;
            completed: number;
        }>;
    }>;
}

export interface TutorEventStats {
    events: Array<{
        event_id: number;
        title: string;
        applications: number;
        date: string;
    }>;
}

/**
 * INFLUENCER ANALYTICS
 */

export interface InfluencerConversionFunnel {
    funnel: Array<{
        stage: string;
        count: number;
    }>;
}

export interface InfluencerRefereeActivity {
    active: number;
    inactive: number;
    by_code: Array<{
        code: string;
        active: number;
        inactive: number;
    }>;
}

export interface InfluencerCodeTrends {
    codes: Array<{
        code: string;
        monthly: Array<{
            month: string;
            referees: number;
        }>;
    }>;
}

/**
 * CONTRIBUTOR ANALYTICS
 */

export interface ContributorAnalytics {
    total_created_users: number;
    by_role: {
        USER: number;
        TUTOR: number;
        INFLUENCER: number;
        [key: string]: number;
    };
    monthly_growth: Array<{
        month: string;
        count: number;
    }>;
    by_code: Array<{
        code: string;
        user_count: number;
    }>;
}

export interface ContributorDashboardSummary {
    total_created: number;
    active_users: number;
    by_role: {
        USER: number;
        TUTOR: number;
        INFLUENCER: number;
        [key: string]: number;
    };
    this_month: number;
    conversion_to_paid: number;
}

export interface ContributorUserActivity {
    active: number;
    inactive: number;
    by_role: {
        USER: { active: number; inactive: number };
        TUTOR: { active: number; inactive: number };
        INFLUENCER: { active: number; inactive: number };
        [key: string]: { active: number; inactive: number };
    };
}

export interface ContributorGeography {
    by_state: Array<{
        state: string;
        count: number;
    }>;
    by_country: Array<{
        country: string;
        count: number;
    }>;
}

/**
 * ADMIN ANALYTICS
 */

export interface AdminDashboard {
    total_users: number;
    total_courses: number;
    total_revenue: number;
    user_growth: Array<{
        month: string;
        count: number;
    }>;
    enrollment_trends: Array<{
        month: string;
        count: number;
    }>;
    user_role_distribution: Array<{
        role: string;
        count: number;
    }>;
    course_category_popularity: Array<{
        category: string;
        enrollments: number;
    }>;
}

export interface AdminQuizStats {
    total_attempts: number;
    passed: number;
    failed: number;
    average_score: number;
}

export interface AdminPlatformSummary {
    total_users: number;
    total_courses: number;
    total_revenue: number;
    monthly_active_users: number;
    course_completion_rate: number;
    avg_platform_rating: number;
    open_support_tickets: number;
    pending_verifications: number;
}

export interface AdminRevenueByCategory {
    by_category: Array<{
        category: string;
        revenue: number;
        enrollments: number;
    }>;
}

export interface AdminUserGrowth {
    monthly: Array<{
        month: string;
        USER: number;
        TUTOR: number;
        INFLUENCER: number;
        CONTRIBUTOR: number;
        ADMIN: number;
        SUPER_ADMIN: number;
        [key: string]: any;
    }>;
}

export interface AdminCompletionTrends {
    monthly: Array<{
        month: string;
        completion_rate: number;
    }>;
}

export interface AdminEventStats {
    events: Array<{
        event_id: number;
        title: string;
        applications: number;
        date: string;
    }>;
    by_month: Array<{
        month: string;
        applications: number;
    }>;
}

export interface AdminRatingStats {
    by_course: Array<{
        course_id: number;
        title: string;
        avg_rating: number;
        reviews: number;
    }>;
    distribution: Array<{
        rating: number;
        count: number;
    }>;
}

export interface AdminGeography {
    by_state: Array<{
        state: string;
        count: number;
    }>;
    by_country: Array<{
        country: string;
        count: number;
    }>;
}

export interface AdminActiveUsers {
    monthly: Array<{
        month: string;
        active: number;
    }>;
}

export interface AdminCoursePerformance {
    courses: Array<{
        course_id: number;
        title: string;
        enrollments: number;
        completion_rate: number;
    }>;
}

export const analyticsApi = {
    // Student Analytics
    getStudentCourseProgress: async (userId?: number): Promise<StudentCourseProgress> => {
        const url = userId ? `/api/progress/?user_id=${userId}` : '/api/progress/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentActivity: async (days: number = 7, userId?: number): Promise<StudentActivity> => {
        let url = `/api/progress/activity/?days=${days}`;
        if (userId) url += `&user_id=${userId}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentQuizSummary: async (userId?: number): Promise<StudentQuizSummary> => {
        let url = '/api/quizzes/my-results/?aggregate=true';
        if (userId) url += `&user_id=${userId}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentDashboardSummary: async (userId?: number): Promise<StudentDashboardSummary> => {
        const url = userId ? `/api/progress/dashboard-summary/?user_id=${userId}` : '/api/progress/dashboard-summary/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentEnrollmentSummary: async (userId?: number): Promise<StudentEnrollmentSummary> => {
        const url = userId ? `/api/enrollments/summary/?user_id=${userId}` : '/api/enrollments/summary/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentSpendingHistory: async (aggregateBy?: 'month', userId?: number): Promise<StudentSpendingHistory> => {
        let url = '/api/transactions/my-history/';
        const params = new URLSearchParams();
        if (aggregateBy) params.append('aggregate_by', aggregateBy);
        if (userId) params.append('user_id', userId.toString());
        if (params.toString()) url += `?${params.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentEventSummary: async (userId?: number): Promise<StudentEventSummary> => {
        const url = userId ? `/api/event-applications/summary/?user_id=${userId}` : '/api/event-applications/summary/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getStudentEnrollmentTimeline: async (userId?: number): Promise<StudentEnrollmentTimeline> => {
        const url = userId ? `/api/enrollments/timeline/?user_id=${userId}` : '/api/enrollments/timeline/';
        const response = await apiClient.get(url);
        return response.data;
    },

    // Tutor Analytics
    getTutorDashboard: async (tutorId?: number): Promise<TutorDashboard> => {
        const url = tutorId ? `/api/tutor/dashboard/?tutor_id=${tutorId}` : '/api/tutor/dashboard/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorQuizStats: async (tutorId?: number): Promise<TutorQuizStats> => {
        const url = tutorId ? `/api/tutor/quiz-stats/?tutor_id=${tutorId}` : '/api/tutor/quiz-stats/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorRevenue: async (aggregateBy?: 'month', tutorId?: number): Promise<TutorRevenue> => {
        let url = '/api/tutor/revenue/';
        const params = new URLSearchParams();
        if (aggregateBy) params.append('aggregate_by', aggregateBy);
        if (tutorId) params.append('tutor_id', tutorId.toString());
        if (params.toString()) url += `?${params.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorDashboardSummary: async (tutorId?: number): Promise<TutorDashboardSummary> => {
        const url = tutorId ? `/api/tutor/dashboard-summary/?tutor_id=${tutorId}` : '/api/tutor/dashboard-summary/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorEnrollmentFunnel: async (tutorId?: number): Promise<TutorEnrollmentFunnel> => {
        const url = tutorId ? `/api/tutor/enrollment-funnel/?tutor_id=${tutorId}` : '/api/tutor/enrollment-funnel/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorRatings: async (tutorId?: number): Promise<TutorRatings> => {
        const url = tutorId ? `/api/tutor/ratings/?tutor_id=${tutorId}` : '/api/tutor/ratings/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorDropoffAnalysis: async (tutorId?: number): Promise<TutorDropoffAnalysis> => {
        const url = tutorId ? `/api/tutor/dropoff-analysis/?tutor_id=${tutorId}` : '/api/tutor/dropoff-analysis/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getTutorEventStats: async (tutorId?: number): Promise<TutorEventStats> => {
        const url = tutorId ? `/api/tutor/event-stats/?tutor_id=${tutorId}` : '/api/tutor/event-stats/';
        const response = await apiClient.get(url);
        return response.data;
    },

    // Influencer Analytics
    getInfluencerConversionFunnel: async (influencerId?: number): Promise<InfluencerConversionFunnel> => {
        const url = influencerId ? `/api/influencer/conversion-funnel/?influencer_id=${influencerId}` : '/api/influencer/conversion-funnel/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getInfluencerRefereeActivity: async (influencerId?: number): Promise<InfluencerRefereeActivity> => {
        const url = influencerId ? `/api/influencer/referee-activity/?influencer_id=${influencerId}` : '/api/influencer/referee-activity/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getInfluencerCodeTrends: async (influencerId?: number): Promise<InfluencerCodeTrends> => {
        const url = influencerId ? `/api/influencer/code-trends/?influencer_id=${influencerId}` : '/api/influencer/code-trends/';
        const response = await apiClient.get(url);
        return response.data;
    },

    // Contributor Analytics
    getContributorAnalytics: async (contributorId?: number): Promise<ContributorAnalytics> => {
        const url = contributorId ? `/api/contributor/analytics/?contributor_id=${contributorId}` : '/api/contributor/analytics/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getContributorDashboardSummary: async (contributorId?: number): Promise<ContributorDashboardSummary> => {
        const url = contributorId ? `/api/contributor/dashboard-summary/?contributor_id=${contributorId}` : '/api/contributor/dashboard-summary/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getContributorUserActivity: async (contributorId?: number): Promise<ContributorUserActivity> => {
        const url = contributorId ? `/api/contributor/user-activity/?contributor_id=${contributorId}` : '/api/contributor/user-activity/';
        const response = await apiClient.get(url);
        return response.data;
    },
    getContributorGeography: async (contributorId?: number): Promise<ContributorGeography> => {
        const url = contributorId ? `/api/contributor/geography/?contributor_id=${contributorId}` : '/api/contributor/geography/';
        const response = await apiClient.get(url);
        return response.data;
    },

    // Admin Analytics
    getAdminDashboard: async (): Promise<AdminDashboard> => {
        const response = await apiClient.get('/api/admin/dashboard/');
        return response.data;
    },
    getAdminQuizStats: async (): Promise<AdminQuizStats> => {
        const response = await apiClient.get('/api/admin/quiz-stats/');
        return response.data;
    },
    getAdminPlatformSummary: async (): Promise<AdminPlatformSummary> => {
        const response = await apiClient.get('/api/admin/platform-summary/');
        return response.data;
    },
    getAdminRevenueByCategory: async (): Promise<AdminRevenueByCategory> => {
        const response = await apiClient.get('/api/admin/revenue-by-category/');
        return response.data;
    },
    getAdminUserGrowth: async (): Promise<AdminUserGrowth> => {
        const response = await apiClient.get('/api/admin/user-growth/');
        return response.data;
    },
    getAdminCompletionTrends: async (): Promise<AdminCompletionTrends> => {
        const response = await apiClient.get('/api/admin/completion-trends/');
        return response.data;
    },
    getAdminEventStats: async (): Promise<AdminEventStats> => {
        const response = await apiClient.get('/api/admin/event-stats/');
        return response.data;
    },
    getAdminRatingStats: async (): Promise<AdminRatingStats> => {
        const response = await apiClient.get('/api/admin/rating-stats/');
        return response.data;
    },
    getAdminGeography: async (): Promise<AdminGeography> => {
        const response = await apiClient.get('/api/admin/users/geography/');
        return response.data;
    },
    getAdminActiveUsers: async (): Promise<AdminActiveUsers> => {
        const response = await apiClient.get('/api/admin/active-users/');
        return response.data;
    },
    getAdminCoursePerformance: async (): Promise<AdminCoursePerformance> => {
        const response = await apiClient.get('/api/admin/course-performance/');
        return response.data;
    },
};

export default analyticsApi;
