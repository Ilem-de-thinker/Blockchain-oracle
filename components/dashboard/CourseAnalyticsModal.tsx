import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Chart } from '@/components/ui/chart';
import { progressApi, CourseProgressDetail } from '@/src/api/progress';
import {
  RefreshCcw,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseAnalyticsModalProps {
  courseId: number;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

type ChartType = 'completion' | 'materials';

const CourseAnalyticsModal: React.FC<CourseAnalyticsModalProps> = ({
  courseId,
  courseTitle,
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<CourseProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<ChartType>('completion');

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
      setActiveChart('completion');
    }
  }, [isOpen, courseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await progressApi.getCourseProgress(courseId);
      setData(details);
    } catch (err) {
      console.error('Failed to fetch course analytics:', err);
      setError('Could not load course analytics.');
    } finally {
      setLoading(false);
    }
  };

  const modules = data?.modules?.map(m => {
    const pct = m.total_materials > 0 ? Math.round((m.completed_materials / m.total_materials) * 100) : 0;
    let status: string;
    if (pct >= 100) status = 'Completed';
    else if (pct > 0) status = 'In Progress';
    else status = 'Locked';
    return {
      id: String(m.module_id).padStart(2, '0'),
      name: m.title,
      status,
      score: pct,
    };
  }) || [];

  const completedMaterials = data?.completed_materials ?? 0;
  const totalMaterials = data?.total_materials ?? 0;
  const totalTime = (data?.time_spent_minutes ?? 0) || completedMaterials * 20;
  const hours = Math.floor(totalTime / 60);
  const mins = totalTime % 60;
  const timeDisplay = `${hours}h ${mins}m`;

  const moduleCompletionData = modules.map(m => ({
    label: m.name.length > 12 ? m.name.substring(0, 12) + '...' : m.name,
    value: m.score,
    color: m.status === 'Completed' ? '#22c55e' : m.status === 'In Progress' ? '#f59e0b' : '#94a3b8',
  }));

  const moduleMaterialsData = (data?.modules || []).map(m => ({
    label: m.title.length > 12 ? m.title.substring(0, 12) + '...' : m.title,
    completed: m.completed_materials,
    total: m.total_materials,
  }));

  const chartTabs = [
    { id: 'completion' as ChartType, label: 'Completion Rate', icon: TrendingUp },
    { id: 'materials' as ChartType, label: 'Materials', icon: BookOpen },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 overflow-hidden rounded-3xl" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <DialogHeader className="p-8 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-semibold text-text">{courseTitle}</DialogTitle>
              <p className="text-xs text-text-muted uppercase tracking-widest mt-1">Detailed Breakdown</p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-bold text-text-muted animate-pulse">Calculating Data...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center space-y-4 px-8">
            <p className="text-sm text-rose-500 font-medium">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8">
            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block mb-1">Time</span>
                <span className="text-lg font-medium text-text">{timeDisplay}</span>
              </div>
              <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block mb-1">Materials</span>
                <span className="text-lg font-medium text-text">{completedMaterials}/{totalMaterials}</span>
              </div>
              <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block mb-1">Progress</span>
                <span className="text-lg font-medium text-text">{Math.round(data.completion_percentage)}%</span>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Module Analytics</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chartTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors",
                      activeChart === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-text-muted hover:text-text"
                    )}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="bg-surface-alt/50 p-4 rounded-xl border border-border">
                {activeChart === 'completion' && (
                  moduleCompletionData.length > 0 ? (
                    <Chart type="bar" data={moduleCompletionData} height={180} />
                  ) : (
                    <div className="h-[180px] flex items-center justify-center border border-dashed border-border rounded-lg">
                      <p className="text-xs text-text-muted italic">No module data</p>
                    </div>
                  )
                )}
                {activeChart === 'materials' && (
                  moduleMaterialsData.length > 0 ? (
                    <Chart type="bar" data={moduleMaterialsData} height={180} />
                  ) : (
                    <div className="h-[180px] flex items-center justify-center border border-dashed border-border rounded-lg">
                      <p className="text-xs text-text-muted italic">No materials data</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Module List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Course Modules</h4>
              <div className="space-y-3">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-surface-alt/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-text-muted">{mod.id}</span>
                      <div>
                        <p className="text-sm font-medium text-text">{mod.name}</p>
                        <p
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            mod.status === 'Completed'
                              ? 'text-emerald-500'
                              : mod.status === 'In Progress'
                              ? 'text-amber-500'
                              : 'text-gray-400'
                          )}
                        >
                          {mod.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {mod.score > 0 ? (
                        <span className="text-sm font-semibold text-text">{mod.score}%</span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="p-8 bg-surface-alt border-t border-border">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3.5 rounded-2xl text-sm font-semibold hover:opacity-90 transition-all"
          >
            Close Report
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseAnalyticsModal;
