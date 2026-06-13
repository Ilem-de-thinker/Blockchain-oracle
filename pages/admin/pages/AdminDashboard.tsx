import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, Course } from '../../../src/api/courses';
import eventsApi, { Event } from '../../../src/api/events';
import usersApi from '../../../src/api/users';
import adminPaymentsApi from '../../../src/api/admin-payments';
import { analyticsApi } from '../../../src/api/analytics'; 
import { Chart } from '../../../components/ui/chart';
import { ReportActions } from '../../../components/ui/ReportActions';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';

const AdminDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    new: 0,
    tutors: 0
  });
  const [platformSummary, setPlatformSummary] = useState<any>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<any>(null);
  const [geographyData, setGeographyData] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [userGrowthData, setUserGrowthData] = useState<any>(null);
  const [completionTrendsData, setCompletionTrendsData] = useState<any>(null);
  const [activeUsersData, setActiveUsersData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [eventStatsData, setEventStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedCourseId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { startDate, endDate } = getDateRange(timeRange);
    
    try {
      const [
        courseData, 
        eventsResponse, 
        summary, 
        revenueCat, 
        geo, 
        ratings,
        userGrowth,
        completionTrends,
        activeUsers,
        eventStats,
        dashboard,
        quizStats, 
        coursePerf
      ] = await Promise.allSettled([
        coursesApi.getCourses(1, 10),
        eventsApi.getEvents(1, 5),
        analyticsApi.getAdminPlatformSummary(),
        analyticsApi.getAdminRevenueByCategory(),
        analyticsApi.getAdminGeography(),
        analyticsApi.getAdminRatingStats(),
        analyticsApi.getAdminUserGrowth(),
        analyticsApi.getAdminCompletionTrends(),
        analyticsApi.getAdminActiveUsers(),
        analyticsApi.getAdminEventStats(),
        analyticsApi.getAdminDashboard(),
        analyticsApi.getAdminQuizStats(),
        analyticsApi.getAdminCoursePerformance(),
      ]);
      
      if (courseData.status === 'fulfilled') setCourses(courseData.value.items || []);
      if (eventsResponse.status === 'fulfilled') setEvents(eventsResponse.value.results || []);
      
      if (summary.status === 'fulfilled') setPlatformSummary(summary.value);
      if (revenueCat.status === 'fulfilled') setRevenueByCategory(revenueCat.value);
      if (geo.status === 'fulfilled') setGeographyData(geo.value);
      if (ratings.status === 'fulfilled') setRatingStats(ratings.value);
      if (userGrowth.status === 'fulfilled') setUserGrowthData(userGrowth.value);
      if (completionTrends.status === 'fulfilled') setCompletionTrendsData(completionTrends.value);
      if (activeUsers.status === 'fulfilled') setActiveUsersData(activeUsers.value);
      if (eventStats.status === 'fulfilled') setEventStatsData(eventStats.value);

      if (dashboard.status === 'fulfilled') {
        setDashboardData({
          ...dashboard.value,
          quiz_stats: quizStats.status === 'fulfilled' ? quizStats.value : null,
          course_performance: coursePerf.status === 'fulfilled' ? coursePerf.value : null
        });
        
        // Use dashboard data for user stats if summary is missing
        if (dashboard.value.user_role_distribution) {
          const tutorCount = dashboard.value.user_role_distribution.find((r: any) => r.role === 'TUTOR')?.count || 0;
          setUserStats(prev => ({
            ...prev,
            total: dashboard.value.total_users,
            tutors: tutorCount
          }));
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalCourses: platformSummary?.total_courses || courses.length,
    activeUsers: platformSummary?.monthly_active_users || userStats.active,
    totalRevenue: `₦${(platformSummary?.total_revenue || 0).toLocaleString()}`,
    completionRate: `${(platformSummary?.course_completion_rate || 0).toFixed(1)}%`,
    pendingVerifications: platformSummary?.pending_verifications || 0,
    avgRating: (platformSummary?.avg_platform_rating || 0).toFixed(1),
    openSupportTickets: platformSummary?.open_support_tickets || 0,
    quizAverage: (dashboardData?.quiz_stats?.average_score || 0).toFixed(1),
  };

  const recentCourses = courses.slice(0, 5);
  
  const getRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-600"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner 
        name={firstName}
        message="Oversee platform activity, manage courses, and review student progress. There are new course submissions waiting for your approval!"
        actionText="Review Courses"
        actionLink="/admin/courses"
      />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <ReportActions disableCsv disableJson />
        </div>
      </div>

      {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-3">
          <div className="bg-surface rounded-xl border border-border p-3">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="fas fa-book text-purple-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Courses</p>
              <p className="text-lg font-bold text-text">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <i className="fas fa-users text-emerald-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Active Users</p>
              <p className="text-lg font-bold text-text">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-naira-sign text-blue-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Revenue</p>
              <p className="text-lg font-bold text-text">{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <i className="fas fa-chart-line text-amber-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Completion Rate</p>
              <p className="text-lg font-bold text-text">{stats.completionRate}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <i className="fas fa-shield-alt text-teal-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Pending Verif.</p>
              <p className="text-lg font-bold text-text">{stats.pendingVerifications}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <i className="fas fa-star text-pink-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Avg Rating</p>
              <p className="text-lg font-bold text-text">{stats.avgRating}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <i className="fas fa-ticket-alt text-rose-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Open Tickets</p>
              <p className="text-lg font-bold text-text">{stats.openSupportTickets}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <i className="fas fa-check-double text-indigo-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Quiz Avg</p>
              <p className="text-lg font-bold text-text">{stats.quizAverage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-text mb-4">Enrollment Trends</h3>
            <Chart 
              type="line" 
              data={dashboardData.enrollment_trends?.map((item: any) => ({ label: item.month, value: item.count })) || []} 
              height={250} 
            />
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-text mb-4">Revenue by Category</h3>
            <Chart 
              type="bar" 
              data={revenueByCategory?.by_category?.map((item: any) => ({ label: item.category, value: item.revenue })) || []} 
              height={250} 
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center">
          <h3 className="text-sm font-bold text-text mb-4 w-full text-left">Geography Distribution</h3>
          <div className="h-[250px] w-full">
            <Chart 
              type="pie" 
              data={geographyData?.by_country?.slice(0, 5).map((item: any) => ({ label: item.country, value: item.count })) || []} 
              height={250} 
            />
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center">
          <h3 className="text-sm font-bold text-text mb-4 w-full text-left">Quiz Performance</h3>
          <div className="h-[250px] w-full">
            <Chart 
              type="pie" 
              data={
                selectedCourseId !== 'all'
                  ? [
                      { label: 'Passed', value: dashboardData?.quiz_stats?.per_course?.find((c: any) => String(c.course_id) === selectedCourseId)?.passed || 0, color: '#22c55e' },
                      { label: 'Failed', value: dashboardData?.quiz_stats?.per_course?.find((c: any) => String(c.course_id) === selectedCourseId)?.failed || 0, color: '#ef4444' }
                    ]
                  : [
                      { label: 'Passed', value: dashboardData?.quiz_stats?.passed || 0, color: '#22c55e' },
                      { label: 'Failed', value: dashboardData?.quiz_stats?.failed || 0, color: '#ef4444' }
                    ]
              } 
              height={250} 
            />
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center">
          <h3 className="text-sm font-bold text-text mb-4 w-full text-left">Rating Distribution</h3>
          <div className="h-[250px] w-full">
            <Chart 
              type="bar" 
              data={ratingStats?.distribution?.map((item: any) => ({ label: `${item.rating} Star`, value: item.count })) || []} 
              height={250} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold text-text mb-4">User Growth (Learners)</h3>
          <Chart
            type="line"
            data={userGrowthData?.monthly?.map((item: any) => ({ label: item.month, value: item.USER || 0 })) || []}
            height={220}
          />
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold text-text mb-4">Completion Trends</h3>
          <Chart
            type="line"
            data={completionTrendsData?.monthly?.map((item: any) => ({ label: item.month, value: item.completion_rate || 0 })) || []}
            height={220}
          />
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold text-text mb-4">Monthly Active Users</h3>
          <Chart
            type="bar"
            data={activeUsersData?.monthly?.map((item: any) => ({ label: item.month, value: item.active || 0 })) || []}
            height={220}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Recent Courses</h3>
            </div>
            <Link to="/admin/courses" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          {recentCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-book text-gray-400 text-lg"></i>
              </div>
              <p className="text-sm font-medium text-text">No courses yet</p>
              <p className="text-xs text-text-muted mt-1">Create your first course to get started</p>
              <Link to="/admin/courses/create" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
                <i className="fas fa-plus"></i>
                Create Course
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-bg border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase">Course</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase">Category</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase">Level</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-secondary uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-bg transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail_url || 'https://via.placeholder.com/80'}
                            alt={course.title}
                            className="w-12 h-10 rounded-lg object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text truncate max-w-[150px]">{course.title}</p>
                            <p className="text-xs text-text-muted truncate max-w-[150px]">{course.tutor.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-hover text-gray-700">
                          {course.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                          course.level === 'Beginner' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          course.level === 'Intermediate' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                          'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                          {course.level || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                          course.is_published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            course.is_published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-semibold text-text">
                          {(course.total_amount === '0.00' || course.total_amount === '0' || !course.total_amount) 
                            ? (course.price === '0.00' || course.price === '0' ? 'Free' : `₦${course.price}`) 
                            : `₦${course.total_amount}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border p-4 h-[440px] flex flex-col">
            <div className="flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-text">Recent Events</h3>
              </div>
              <Link to="/admin/events" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3 overflow-y-auto flex-1 pr-1">
              {events.length === 0 ? (
                <div className="rounded-lg bg-bg px-3 py-4 text-sm text-text-muted">No events found.</div>
              ) : (
                events.map((event) => (
                  <Link key={event.id} to={`/admin/events/${event.id}`} className="block rounded-lg border border-gray-100 px-3 py-3 hover:bg-bg">
                    <p className="text-sm font-semibold text-text">{event.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">
                      {event.type} · {new Date(event.date).toLocaleDateString()}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text">Top Event Applications</h3>
              <Link to="/admin/events" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                View events
              </Link>
            </div>
            <div className="space-y-2">
              {(eventStatsData?.events || []).slice(0, 5).map((event: any) => (
                <div key={event.event_id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <p className="text-xs font-medium text-text truncate mr-2">{event.title}</p>
                  <span className="text-xs font-bold text-emerald-700">{event.applications}</span>
                </div>
              ))}
              {(!eventStatsData?.events || eventStatsData.events.length === 0) && (
                <p className="text-xs text-text-muted">No event application stats available.</p>
              )}
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text">Top Rated Courses</h3>
              <Link to="/admin/reviews" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                View reviews
              </Link>
            </div>
            <div className="space-y-2">
              {(ratingStats?.by_course || []).slice(0, 5).map((course: any) => (
                <div key={course.course_id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <p className="text-xs font-medium text-text truncate mr-2">{course.title}</p>
                  <span className="text-xs font-bold text-amber-600">{Number(course.avg_rating || 0).toFixed(1)}★</span>
                </div>
              ))}
              {(!ratingStats?.by_course || ratingStats.by_course.length === 0) && (
                <p className="text-xs text-text-muted">No rating stats available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
