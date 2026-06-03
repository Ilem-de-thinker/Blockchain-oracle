import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usersApi, { User, UpdateUserData } from '../../../src/api/users';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import RichTextEditor from '../../../components/ui/rich-text-editor';
import { useToast } from '../../../src/hooks/useToast';
import { ArrowLeft, Save, Shield, User as UserIcon, Mail, Phone, MapPin } from 'lucide-react';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUserData>({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    bio: '',
    role: 'USER',
    is_active: true,
  });

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

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const user = await usersApi.getUser(parseInt(id));
        setFormData({
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number || '',
          address: user.address || '',
          bio: user.bio || '',
          role: user.role,
          is_active: user.is_active,
        });
      } catch (error) {
        toast.error('Failed to load user details');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleBioChange = (content: string) => {
    setFormData(prev => ({ ...prev, bio: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaving(true);
      await usersApi.updateUser(parseInt(id), formData);
      toast.success('User updated successfully');
      navigate(`/admin/users/${id}`);
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/admin/users/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text">Edit User Profile</h1>
          <p className="text-sm text-text-muted">Update account information and permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <UserIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-text">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+234..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              >
                <option value="USER">User / Student</option>
                <option value="TUTOR">Tutor / Instructor</option>
                {currentUserRole === 'SUPER_ADMIN' && (
                  <>
                    <option value="ADMIN">Administrator</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Street, City, Country"
            />
          </div>
        </div>

        {/* Biography */}
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Shield className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-text">Biography / About</h2>
          </div>
          <RichTextEditor
            value={formData.bio || ''}
            onChange={handleBioChange}
            placeholder="Tell us about this user..."
            minHeight="250px"
          />
        </div>

        {/* Account Status */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text">Account Status</h3>
              <p className="text-xs text-text-muted">Suspended users cannot log in to the platform.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-medium text-text">{formData.is_active ? 'Active' : 'Suspended'}</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate(`/admin/users/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} className="min-w-[140px]">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
