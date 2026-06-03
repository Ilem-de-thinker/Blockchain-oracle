import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';
import { cn } from '@/lib/utils';
import CourseAnalyticsModal from './CourseAnalyticsModal';

interface CourseCardProps {
  course: Course;
  progress: number;
  className?: string;
  compact?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, progress, className, compact }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <Card className={cn(
        "group overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200 hover:border-gray-300",
        className
      )}>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              className={cn(
                "w-full object-cover transition-transform duration-300 group-hover:scale-105",
                compact ? "h-28" : "h-36"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge 
              className="absolute top-3 left-3 bg-white/90 text-gray-900 border-0 font-medium text-xs"
            >
              {course.level}
            </Badge>
            <button 
              onClick={() => setShowAnalytics(true)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
              title="View Analytics"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className={cn("p-4 space-y-3", compact ? "" : "")}>
            <div>
              <h3 className={cn(
                "font-semibold line-clamp-1 group-hover:text-purple-500 transition-colors text-gray-900",
                compact ? "text-sm" : "text-base"
              )}>
                {course.title}
              </h3>
              {!compact && (
                <p className="text-xs mt-1 text-gray-500">
                  {course.instructor}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Progress</span>
                <span className="text-purple-500 font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-3 w-3" />
                  {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowAnalytics(true)}
                  className="h-8 px-2 text-[10px] font-bold uppercase text-gray-500 hover:text-purple-600"
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  Analytics
                </Button>
                <Button 
                  size="sm" 
                  asChild
                  className="h-8 text-xs bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Link to={`/player/${course.id}`}>
                    <Play className="h-3 w-3 mr-1" />
                    Continue
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CourseAnalyticsModal 
        courseId={Number(course.id)} 
        courseTitle={course.title}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </>
  );
};

export default CourseCard;

