import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}) => {
  const variantClasses = {
    default: 'bg-surface-hover text-gray-700',
    primary: 'bg-purple-100 text-purple-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full
      ${variantClasses[variant]} ${sizeClasses[size]}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}></span>}
      {children}
    </span>
  );
};

interface StatusPillProps {
  status: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, variant }) => {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Active', variant: 'success' },
    published: { label: 'Published', variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
    paid: { label: 'Paid', variant: 'success' },
    approved: { label: 'Approved', variant: 'success' },
    
    pending: { label: 'Pending', variant: 'warning' },
    draft: { label: 'Draft', variant: 'warning' },
    processing: { label: 'Processing', variant: 'warning' },
    
    inactive: { label: 'Inactive', variant: 'danger' },
    suspended: { label: 'Suspended', variant: 'danger' },
    banned: { label: 'Banned', variant: 'danger' },
    archived: { label: 'Archived', variant: 'danger' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    failed: { label: 'Failed', variant: 'danger' },
    rejected: { label: 'Rejected', variant: 'danger' },
    
    new: { label: 'New', variant: 'info' },
    upcoming: { label: 'Upcoming', variant: 'info' },
    
    default: { label: status, variant: variant || 'default' },
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: string;
  iconBg?: string;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBg = 'bg-purple-100',
  color = 'purple',
}) => {
  const colorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const bgClasses = {
    purple: 'bg-purple-100',
    blue: 'bg-blue-100',
    green: 'bg-purple-100',
    orange: 'bg-orange-100',
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{title}</p>
          <p className="text-3xl font-bold text-text">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <i className={`fas fa-arrow-${change.trend === 'up' ? 'up' : 'down'} text-sm ${
                change.trend === 'up' ? 'text-purple-500' : 'text-red-500'
              }`}></i>
              <span className={`text-sm font-medium ${
                change.trend === 'up' ? 'text-purple-500' : 'text-red-500'
              }`}>
                {change.value}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgClasses[color]} flex items-center justify-center`}>
          <i className={`fas ${icon} ${colorClasses[color]} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fa-folder-open',
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
        <i className={`fas ${icon} text-2xl text-gray-400`}></i>
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-text-muted mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
