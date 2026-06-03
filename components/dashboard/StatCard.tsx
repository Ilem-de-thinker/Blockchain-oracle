import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeIcon } from '@/components/ui/theme-icon';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn(
      "border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white border-gray-200 hover:border-gray-300",
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  'text-xs font-semibold',
                  trend.isPositive ? 'text-primary' : 'text-red-500'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-400">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <ThemeIcon 
            icon={Icon} 
            containerClassName="w-12 h-12 bg-primary/10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
