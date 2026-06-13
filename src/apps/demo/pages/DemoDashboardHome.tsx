import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, TrendingUp, Award, Clock, ArrowRight } from 'lucide-react';
import { User } from '@/types';
import { coursesApi } from '@/src/api/courses';
import eventsApi from '@/src/api/events';

interface DemoHomeProps {
  user: User | null;
}

const DemoDashboardHome: React.FC<DemoHomeProps> = ({ user }) => {
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    coursesApi.getEnrollments(1, 1).then((res) => setEnrollmentCount(res.count || 0)).catch(() => {});
    eventsApi.getEvents(1, 1).then((res) => setEventCount(res.count || 0)).catch(() => {});
  }, []);

  const stats = [
    { icon: BookOpen, label: 'Enrolled Courses', value: enrollmentCount, color: 'text-purple-500', bg: 'bg-purple-100' },
    { icon: Calendar, label: 'Events Registered', value: eventCount, color: 'text-blue-500', bg: 'bg-blue-100' },
    { icon: Award, label: 'Certificates', value: 0, color: 'text-amber-500', bg: 'bg-amber-100' },
    { icon: TrendingUp, label: 'Avg Progress', value: '--', color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="text-xs text-text-muted mt-0.5">Here's your learning overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-text">{s.value}</p>
                <p className="text-[10px] text-text-muted">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            {[
              { icon: BookOpen, label: 'Browse Courses', href: '/demo-dashboard/courses', desc: 'Explore new learning opportunities' },
              { icon: Calendar, label: 'View Events', href: '/demo-dashboard/events', desc: 'Check upcoming webinars and workshops' },
              { icon: Clock, label: 'Continue Learning', href: '/demo-dashboard/courses', desc: 'Resume your last active course' },
            ].map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-alt transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs font-medium text-text">{action.label}</p>
                    <p className="text-[10px] text-text-muted">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold text-text mb-4">Activity Feed</h2>
          <div className="space-y-3">
            {[
              { text: 'You enrolled in "Blockchain Fundamentals"', time: '2 days ago' },
              { text: 'You completed "Intro to Web3" module', time: '5 days ago' },
              { text: 'Certificate issued for "Crypto Basics"', time: '1 week ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-b-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary/30 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-text">{activity.text}</p>
                  <p className="text-[9px] text-text-muted mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboardHome;
