import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { contributorApi, ContributorUser } from '../../src/api/contributor';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReportActions } from '../../components/ui/ReportActions';
import { Users } from 'lucide-react';

interface ContributorMyUsersPageProps {
  user: User | null;
}

const ContributorMyUsersPage: React.FC<ContributorMyUsersPageProps> = () => {
  const [users, setUsers] = useState<ContributorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useLocalStorage('contributor_my_users_search', '');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await contributorApi.getCreatedUsers();
        setUsers(data.created_users || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-bg text-text text-sm"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Contributor Workspace
              </p>
              <CardTitle className="mt-1 text-xl sm:text-2xl">
                My Users
              </CardTitle>
              <p className="mt-1 text-sm text-text-muted">
                Manage and view your referral network.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:min-w-[240px]">
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                />
              </div>
              <ReportActions />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center text-text-muted">
                <Users className="h-10 w-10 text-text-muted/40" />
                <div>
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs mt-1">
                    {search ? 'Try a different search term.' : 'Start creating users to build your network.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(u => (
                  <div key={u.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:bg-surface/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>
                          {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{u.full_name}</p>
                        <p className="truncate text-xs text-text-muted">{u.email}</p>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-text-secondary">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ContributorMyUsersPage;
