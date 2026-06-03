import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usersApi, { CreateUserData } from '../../src/api/users';
import { getErrorMessage } from '../../src/api/errorHandler';
import { Button } from '../../components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const roleOptions = ['Learner', 'Tutor', 'Admin', 'Super Admin', 'Influencer', 'Contributor'] as const;

const roleMap: Record<(typeof roleOptions)[number], CreateUserData['role']> = {
  Learner: 'USER',
  Tutor: 'TUTOR',
  Admin: 'ADMIN',
  'Super Admin': 'SUPER_ADMIN',
  Influencer: 'INFLUENCER',
  Contributor: 'CONTRIBUTOR',
};

const SuperAdminCreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const DEFAULT_SUPER_USER_FORM: CreateUserData = {
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'USER',
    is_active: true,
  };

  const [formData, setFormData] = useLocalStorage<CreateUserData>('super_create_user_data', DEFAULT_SUPER_USER_FORM);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === 'role_label') {
      setFormData((prev) => ({ ...prev, role: roleMap[value as keyof typeof roleMap] }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await usersApi.createUser(formData);
      setFormData(DEFAULT_SUPER_USER_FORM);
      navigate('/super-admin/users');
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(getErrorMessage(err) || 'Failed to create user');
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Privileged User Creation</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Provision roles from one place.</h1>
        <p className="mt-3 text-sm text-gray-600">This is the super-admin-owned page for creating users across all supported roles.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Full name
              <input name="full_name" value={formData.full_name} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" placeholder="Amina Yusuf" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Username
              <input name="username" value={formData.username} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" placeholder="amina.yusuf" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Email
              <input name="email" value={formData.email} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" placeholder="amina@example.com" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Password
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" placeholder="Temporary password" />
            </label>
            <label className="text-sm font-medium text-gray-700 md:col-span-2">
              Role
              <select name="role_label" onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" defaultValue="Learner">
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <Button isLoading={saving} type="submit">
              {saving ? 'Creating...' : 'Create User'}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate('/super-admin/users')}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Role Notes</h2>
          <div className="mt-4 space-y-3">
            {roleOptions.map((role) => (
              <div key={role} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{role}</span> creation rules and onboarding checks belong here.
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default SuperAdminCreateUserPage;
