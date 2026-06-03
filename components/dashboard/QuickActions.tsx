import React from 'react';
import { Zap, BookOpen, Calendar, Award, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  action: () => void;
  color: 'purple' | 'green' | 'blue' | 'orange';
}

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className }) => {
  const quickActions: QuickAction[] = [
    {
      label: 'Start Learning',
      icon: Zap,
      action: () => console.log('Start Learning'),
      color: 'purple',
    },
    {
      label: 'Browse Courses',
      icon: BookOpen,
      action: () => console.log('Browse Courses'),
      color: 'green',
    },
    {
      label: 'Upcoming Events',
      icon: Calendar,
      action: () => console.log('Upcoming Events'),
      color: 'blue',
    },
    {
      label: 'My Certificates',
      icon: Award,
      action: () => console.log('My Certificates'),
      color: 'orange',
    },
  ];

  const colorVariants = {
    purple: {
      hover: 'hover:from-purple-600/20 hover:to-purple-600/5',
      border: 'hover:border-purple-600/40',
      icon: 'text-purple-400',
    },
    green: {
      hover: 'hover:from-green-700/20 hover:to-green-700/5',
      border: 'hover:border-green-600/40',
      icon: 'text-success',
    },
    blue: {
      hover: 'hover:from-blue-600/20 hover:to-blue-600/5',
      border: 'hover:border-blue-600/40',
      icon: 'text-blue-400',
    },
    orange: {
      hover: 'hover:from-orange-600/20 hover:to-orange-600/5',
      border: 'hover:border-orange-600/40',
      icon: 'text-orange-400',
    },
  };

  return (
    <Card className={cn(
      'bg-white border-gray-200',
      className
    )}>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const variant = colorVariants[action.color];
            return (
              <Button
                key={action.label}
                variant="ghost"
                onClick={action.action}
                className={cn(
                  'h-auto py-4 px-3 flex flex-col gap-2 bg-white border border-gray-200 transition-all',
                  variant.hover,
                  variant.border
                )}
              >
                <Icon className={cn('h-5 w-5', variant.icon)} />
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
