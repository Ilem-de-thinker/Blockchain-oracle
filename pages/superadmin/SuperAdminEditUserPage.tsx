import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usersApi, { UpdateUserData, User } from '../../src/api/users';
import { adminApiEndpoints } from '../admin/services/adminApi';
import { Button } from '../../components/ui/button';

const roleOptions: User['role'][] = ['USER', 'TUTOR', 'ADMIN', 'SUPER_ADMIN'];

const SuperAdminEditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateUserData>({
    full_name: '',
    email: '',
    role: 'USER',
    is_active: true,
    can_verify: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        const userData = await usersApi.getUser(parseInt(id, 10));
        if (userData) {
          setFormData({
            full_name: userData.full_name,
            email: userData.email,
            phone_number: userData.phone_number,
            address: userData.address,
            bio: userData.bio,
            role: userData.role,
            is_active: userData.is_active,
            can_verify: userData.can_verify ?? false,
          });
        }
      } catch (error) {
        console.error('Failed to load user for editing:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await adminApiEndpoints.users.update(id, formData);
      navigate(`/super-admin/users/${id}`);
    } catch (error) {
      console.error('Failed to update user:', error);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 text-sm text-gray-500 shadow-sm">Loading user...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Edit User</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Update privileged account details.</h1>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Full name
            <input name="full_name" value={formData.full_name || ''} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Email
            <input name="email" value={formData.email || ''} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Role
            <select name="role" value={formData.role || 'USER'} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm">
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 self-end rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
            <input type="checkbox" name="is_active" checked={Boolean(formData.is_active)} onChange={handleChange} />
            Active account
          </label>
          <label className="flex items-center gap-3 self-end rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 md:col-span-2">
            <input type="checkbox" name="can_verify" checked={Boolean(formData.can_verify)} onChange={handleChange} />
            Can verify courses (permission to verify course listings)
          </label>
        </div>

        <div className="mt-5 flex gap-3">
          <Button isLoading={saving} type="submit">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" type="button" onClick={() => navigate(`/super-admin/users/${id}`)}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SuperAdminEditUserPage;
