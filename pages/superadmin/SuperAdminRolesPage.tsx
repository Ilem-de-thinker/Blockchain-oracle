import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usersApi, { User } from '../../src/api/users';
import { Badge } from '../../components/ui/badge';
import { ReportActions } from '../../components/ui/ReportActions';

interface RoleCard {
  name: string;
  apiRole: string;
  access: string;
  count: string;
}

const roleDefinitions: RoleCard[] = [
  { name: 'Learner', apiRole: 'USER', access: 'Learning, orders, subscriptions, events', count: '0' },
  { name: 'Tutor', apiRole: 'TUTOR', access: 'Course creation, analytics, events manager', count: '0' },
  { name: 'Admin', apiRole: 'ADMIN', access: 'Operations, moderation, payments, platform controls', count: '0' },
  { name: 'Super Admin', apiRole: 'SUPER_ADMIN', access: 'Privileged creation, role governance, audit oversight', count: '0' },
  { name: 'Influencer', apiRole: 'INFLUENCER', access: 'Partner workspace, campaigns, referrals', count: '0' },
  { name: 'Contributor', apiRole: 'CONTRIBUTOR', access: 'Content creation, module management', count: '0' },
];

const SuperAdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleCard[]>(roleDefinitions);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const loadRoleStats = async () => {
      try {
        const stats = await usersApi.getUserStats();
        setRoles(roleDefinitions.map(r => ({
          ...r,
          count: (stats.users_by_role as any)[r.apiRole]?.toString() || '0',
        })));
      } catch (error) {
        console.error('Failed to load role stats:', error);
      }
    };

    loadRoleStats();
  }, []);

  const handleRoleClick = async (apiRole: string) => {
    setSelectedRole(apiRole);
    setLoadingUsers(true);
    try {
      const response = await usersApi.getUsers(1, apiRole);
      setUsers(response.results || []);
    } catch (error) {
      console.error('Failed to load users for role:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const roleDisplayName = (apiRole: string) =>
    roleDefinitions.find(r => r.apiRole === apiRole)?.name || apiRole;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">Role Governance</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Inspect role boundaries and privileges.</h1>
            <p className="mt-3 text-sm text-gray-600">
              Click a role card to view all users assigned to that role.
            </p>
          </div>
          <ReportActions />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.apiRole}
            onClick={() => handleRoleClick(role.apiRole)}
            className={`rounded-2xl border p-5 shadow-sm text-left transition-all ${
              selectedRole === role.apiRole
                ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">{role.name}</h2>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{role.count}</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">{role.access}</p>
          </button>
        ))}
      </div>

      {selectedRole && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {roleDisplayName(selectedRole)} Users
              <span className="ml-2 text-sm font-normal text-gray-500">({users.length})</span>
            </h2>
            <Link
              to={`/super-admin/users`}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              View all users →
            </Link>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">No users found for this role.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined</th>
                    <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                            {u.full_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600">{u.email}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={u.is_active ? 'success' : 'destructive'} className="text-[10px]">
                          {u.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Link
                          to={`/super-admin/users/${u.id}`}
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length > 10 && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  Showing 10 of {users.length} users.{' '}
                  <Link to={`/super-admin/users`} className="text-purple-600 hover:text-purple-700 font-semibold">
                    View all users
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminRolesPage;
