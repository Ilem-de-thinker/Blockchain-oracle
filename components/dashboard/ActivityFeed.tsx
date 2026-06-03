import React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'course' | 'achievement' | 'event' | 'certificate';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className }) => {
  const getIconStyle = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course':
        return { bg: 'bg-purple-500/10', icon: 'text-purple-500' };
      case 'achievement':
        return { bg: 'bg-yellow-500/10', icon: 'text-yellow-500' };
      case 'event':
        return { bg: 'bg-green-500/10', icon: 'text-success' };
      case 'certificate':
        return { bg: 'bg-blue-500/10', icon: 'text-blue-500' };
      default:
        return { bg: 'bg-gray-500/10', icon: 'text-gray-500' };
    }
  };

  return (
    <Card className={cn(
      "border shadow-sm bg-white border-gray-200",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
            <Activity className="h-4 w-4 text-purple-500" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-gray-100">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              const style = getIconStyle(activity.type);
              return (
                <div key={activity.id} className="flex gap-3 relative">
                  {index < activities.length - 1 && (
                    <div className="absolute left-4 top-10 w-px h-full bg-gray-100" />
                  )}
                  
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: style.bg.includes('/') ? undefined : style.bg }}>
                    <div className={style.icon}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs mt-0.5 text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'ghost' | 'default'; 
  size?: 'sm' | 'default' | 'icon';
  className?: string;
  onClick?: () => void;
}> = ({ children, variant = 'default', size = 'default', className, onClick }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-lg";
  
  const variantStyles = variant === 'ghost' 
    ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
    : 'bg-purple-600 text-white hover:bg-purple-700';
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 py-2',
    icon: 'h-10 w-10',
  };
  
  return (
    <button 
      className={cn(baseStyles, variantStyles, sizeStyles[size], className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActivityFeed;
