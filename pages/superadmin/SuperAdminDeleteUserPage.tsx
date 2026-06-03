import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User } from '../../src/api/users';
import { adminApiEndpoints } from '../admin/services/adminApi';

const SuperAdminDeleteUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        const data = await adminApiEndpoints.users.get(id);
        setUser(data);
      } catch (error) {
        console.error('Failed to load user for deletion:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await adminApiEndpoints.users.delete(id);
      navigate('/super-admin/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 text-sm text-gray-500 shadow-sm">Loading user...</div>;
  }

  return (
    <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">Delete User</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">{user?.full_name || 'User'}</h1>
      <p className="mt-3 max-w-2xl text-sm text-gray-600">This permanently removes the account from the platform. This page gives super admins an owned delete confirmation route.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={handleDelete} disabled={deleting} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {deleting ? 'Deleting...' : 'Delete User'}
        </button>
        <Link to="/super-admin/users" className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminDeleteUserPage;
