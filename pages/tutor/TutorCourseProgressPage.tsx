import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi } from '../../src/api/courses';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { progressApi } from '../../src/api/progress';

const TutorCourseProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await progressApi.getCourseProgress(Number(id));
      setProgress(data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/tutor/courses/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Course Progress</h1>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm h-80">
        <Bar 
          data={{
            labels: progress?.modules?.map((m: any) => m.title) || [],
            datasets: [{
              label: 'Completion %',
              data: progress?.modules?.map((m: any) => m.completion_percentage) || [],
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } }
          }}
        />
      </div>
    </div>
  );
};

export default TutorCourseProgressPage;
