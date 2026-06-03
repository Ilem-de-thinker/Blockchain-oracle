import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { contributorApi, ContributorUser } from '../../src/api/contributor';
import { Search } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Button } from '../../components/ui/button';
import { ReportActions } from '../../components/ui/ReportActions';

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
    <div className="min-h-screen bg-bg text-text text-sm">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">My Users</h1>
            <p className="text-xs text-text-muted mt-1">Manage and view your referral network.</p>
          </div>
          <div className="relative">
            <input 
              className="h-8 pl-8 pr-4 bg-surface border border-border rounded-md text-xs w-64 focus:border-purple-600 outline-none"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ReportActions />
        </header>

        <div className="border border-border rounded-lg overflow-hidden bg-surface">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg text-text-muted border-b border-border uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-text-muted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-text-muted">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-bg transition-colors">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3 text-text-muted">{new Date(u.date_joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContributorMyUsersPage;
