import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, ChevronRight, Filter } from 'lucide-react';
import { coursesApi, Course } from '@/src/api/courses';
import { cn } from '@/lib/utils';

const DemoCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await coursesApi.getCourses(1, 20);
        setCourses(res.items || []);
      } catch { setCourses([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter((c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  }, [courses, search]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="animate-pulse rounded-xl border border-border bg-surface p-4 flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-surface-alt" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-alt rounded w-2/3" />
              <div className="h-3 bg-surface-alt rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">Course Catalog</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-muted">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/dashboard/course/${course.id}`}
              className="rounded-xl border border-border bg-surface p-4 hover:border-primary/20 hover:shadow-sm transition-all group"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-primary/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{course.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {course.level && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-alt text-[9px] font-medium text-text-muted uppercase tracking-wider">
                        {course.level}
                      </span>
                    )}
                    {course.category && (
                      <span className="text-[10px] text-text-muted">{course.category}</span>
                    )}
                    <span className="text-[10px] font-bold text-text ml-auto">
                      {parseFloat(course.total_amount || '0') === 0 ? 'FREE' : `₦${parseInt(course.total_amount || '0').toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemoCoursesPage;
