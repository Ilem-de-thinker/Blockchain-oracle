import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import usersApi, { CreateUserData } from '../../../src/api/users';
import { UserRole } from '../../../types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const roleLabels: Record<string, string> = {
  USER: 'Learner',
  TUTOR: 'Instructor',
  INFLUENCER: 'Influencer',
  CONTRIBUTOR: 'Contributor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    
  // Determine if this is a super admin route
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');
    
  // Get current user's role from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role);
      }
    } catch {
      setCurrentUserRole(null);
    }
  }, []);
    
  const canCreateUsers = currentUserRole === UserRole.SUPER_ADMIN;
    
  const DEFAULT_USER_FORM: CreateUserData = {
    username: '',
    email: '',
    full_name: '',
    password: '',
    phone_number: '',
    address: '',
    bio: '',
    role: 'USER',
    is_active: true,
    country: 'Nigeria',
  };

  const [formData, setFormData] = useLocalStorage<CreateUserData>('create_user_data', DEFAULT_USER_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!formData.full_name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!canCreateUsers) {
      setError('You do not have permission to create users. Only Super Admins can create users.');
      return;
    }

    setSaving(true);
    try {
      await usersApi.createUser(formData);
      setFormData(DEFAULT_USER_FORM);
      navigate(isSuperAdminRoute ? '/super-admin/users' : '/admin/users');
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const errors: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            errors[key] = value.map(String);
          } else if (typeof value === 'string') {
            errors[key] = [value];
          } else if (value && typeof value === 'object' && 'detail' in value) {
            errors[key] = [String((value as any).detail)];
          }
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
        } else {
          setError(data.detail || data.error || data.message || 'Failed to create user.');
        }
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const roleLabels: Record<string, string> = {
    USER: 'Learner',
    TUTOR: 'Instructor',
    INFLUENCER: 'Influencer',
    CONTRIBUTOR: 'Contributor',
    ADMIN: 'Admin',
    SUPER_ADMIN: 'Super Admin',
  };

  const roleDescriptions: Record<string, string> = {
    USER: 'Can enroll in courses and track progress',
    TUTOR: 'Can create and manage courses',
    INFLUENCER: 'Can refer users and earn commissions',
    CONTRIBUTOR: 'Can bulk create users with permanent codes',
    ADMIN: 'Full admin access to manage users, courses, and payments',
    SUPER_ADMIN: 'Highest level access including admin user management',
  };

  const renderFieldError = (field: string) => {
    if (!fieldErrors[field]) return null;
    return fieldErrors[field].map((msg, i) => (
      <p key={i} className="text-xs text-red-500 mt-1">{msg}</p>
    ));
  };

  // Determine the correct base path
  const basePath = isSuperAdminRoute ? '/super-admin' : '/admin';

  if (!canCreateUsers) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
              <Link to={basePath} className="hover:text-emerald-600">Admin</Link>
              <span>/</span>
              <Link to={`${basePath}/users`} className="hover:text-emerald-600">Users</Link>
              <span>/</span>
              <span className="text-text">Create User</span>
            </div>
            <h1 className="text-xl font-bold text-text">Create New User</h1>
            <p className="text-sm text-text-muted">Add a new user to the platform</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Access Denied</h2>
          <p className="text-text-muted mb-6">Only Super Admins can create new users. Contact a Super Admin to create users.</p>
          <Link
            to={`${basePath}/users`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <Link to={basePath} className="hover:text-emerald-600">Admin</Link>
            <span>/</span>
            <Link to={`${basePath}/users`} className="hover:text-emerald-600">Users</Link>
            <span>/</span>
            <span className="text-text">Create User</span>
          </div>
          <h1 className="text-xl font-bold text-text">Create New User</h1>
          <p className="text-sm text-text-muted">Add a new user to the platform</p>
        </div>
        <Link
          to={`${basePath}/users`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:bg-bg text-sm font-medium transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Users
        </Link>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
            <h3 className="text-sm font-bold text-text">
              <i className="fas fa-user mr-2 text-emerald-500"></i>Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('full_name')}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('username')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('email')}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('password')}
              </div>
            </div>
          </div>
          
          {/* Role & Status */}
          <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
            <h3 className="text-sm font-bold text-text">
              <i className="fas fa-shield-alt mr-2 text-emerald-500"></i>Role & Status
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Role <span className="text-red-500">*</span></label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-surface"
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {renderFieldError('role')}
              <p className="text-xs text-text-muted mt-1.5">{roleDescriptions[formData.role]}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                id="is_active"
                className="w-4 h-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="is_active" className="text-sm text-text-muted font-medium">
                Account is active
              </label>
            </div>
          </div>
          
          {/* Contact & Bio */}
          <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
            <h3 className="text-sm font-bold text-text">
              <i className="fas fa-address-card mr-2 text-emerald-500"></i>Contact & Bio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('phone_number')}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  placeholder="Nigeria"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('country')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Lagos, Nigeria"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {renderFieldError('address')}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Short bio about the user..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
                {renderFieldError('bio')}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to={`${basePath}/users`}
              className="px-6 py-2.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-bg font-medium text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-sm hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>Create User
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6">
            <h4 className="text-sm font-bold text-text mb-4">
              <i className="fas fa-info-circle mr-2 text-emerald-500"></i>Role Guide
            </h4>
            <div className="space-y-3">
              {Object.entries(roleLabels).map(([key, label]) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg text-sm transition-all cursor-pointer ${
                    formData.role === key
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-bg border border-border'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: key as CreateUserData['role'] }))}
                >
                  <p className={`font-semibold ${formData.role === key ? 'text-emerald-700' : 'text-text'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{roleDescriptions[key]}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="text-sm font-bold text-amber-800 mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i>Important
            </h4>
            <ul className="text-xs text-amber-700 space-y-1.5">
              <li>• The user will receive no email notification</li>
              <li>• Share the credentials securely with the new user</li>
              <li>• Super Admin role grants full platform access</li>
              <li>• You can change the role later from the user detail page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
