import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi, CourseEnrollment } from '../../src/api/courses';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const TutorEnrollmentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await coursesApi.getCourseEnrollments(Number(id), 1, 100);
      setEnrollments(data.results || []);
    } catch (err) {
      console.error('Failed to load enrollments', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const chartData = {
    labels: ['Enrolled', 'Remaining Capacity'],
    datasets: [{
      data: [enrollments.length, Math.max(0, 50 - enrollments.length)],
      backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(229, 231, 235, 1)'],
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/tutor/courses/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Course Enrollments</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-border bg-surface shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Enrollment Date</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-text-muted">Loading...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-text-muted">No students enrolled yet.</td></tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="p-4">{e.user.full_name}</td>
                    <td className="p-4">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                    <td className="p-4"><Badge variant="success">Enrolled</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold text-text mb-4">Enrollment Distribution</h2>
            <div className="h-48 w-48">
              <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default TutorEnrollmentsPage;
