import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mail, MapPin, Phone, Save, Shield, UserCircle2 } from 'lucide-react';
import { User } from '../../types';
import { authApi, ProfileData } from '../../src/api/auth';
import { analyticsApi } from '../../src/api/analytics';
import usersApi, { UserRatingProfile } from '../../src/api/users';
import { getErrorMessage } from '../../src/api/errorHandler';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WorkspaceProfilePageProps {
  user: User | null;
  roleLabel: string;
  heading: string;
  description: string;
  children?: React.ReactNode;
}

interface ProfileStats {
  totalEnrollments: number;
  completedCourses: number;
  pendingBalance: number;
}

const WorkspaceProfilePage: React.FC<WorkspaceProfilePageProps> = ({
  user,
  roleLabel,
  heading,
  description,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useLocalStorage('workspace_profile_editing', false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [ratings, setRatings] = useState<UserRatingProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const DEFAULT_WORKSPACE_PROFILE = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profilePicture: '',
  };

  const [formData, setFormData] = useLocalStorage('workspace_profile_form_data', DEFAULT_WORKSPACE_PROFILE);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        setProfile(profile);
        try {
          const ratingProfile = await usersApi.getUserRatingProfile(profile.id);
          setRatings(ratingProfile);
        } catch {
          setRatings(null);
        }

        if (profile.role === 'USER') {
          try {
            const summary = await analyticsApi.getStudentDashboardSummary(profile.id);
            setStats({
              totalEnrollments: Number(summary.total_courses || 0),
              completedCourses: Number(summary.completed_courses || 0),
              pendingBalance: 0,
            });
          } catch {
            setStats(null);
          }
        } else {
          setStats(null);
        }

        setFormData({
          fullName: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone_number || '',
          address: profile.address || '',
          bio: profile.bio || '',
          profilePicture: profile.profile_picture || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (user) {
          setFormData({
            fullName: user.name || '',
            email: user.email || '',
            phone: '',
            address: '',
            bio: '',
            profilePicture: user.avatar || '',
          });
        }
        setProfile(null);
        setStats(null);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const url = await authApi.uploadProfilePicture(file);
      setFormData((prev) => ({ ...prev, profilePicture: url }));
      setSuccess('Profile picture uploaded');
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await authApi.updateProfile({
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address,
        lga: profile?.lga || undefined,
        state: profile?.state || undefined,
        country: profile?.country || undefined,
        bio: formData.bio,
      });
      const refreshed = await authApi.getProfile();
      setProfile(refreshed);
      setSuccess('Profile updated successfully');
      setEditing(false);

    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-text">
            <UserCircle2 className="h-6 w-6 text-primary" />
            {heading}
          </CardTitle>
          <CardDescription className="text-text-muted">{description}</CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-3xl bg-surface border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col items-center gap-4">
              <img
                src={formData.profilePicture || `https://i.pravatar.cc/160?u=${formData.email || user?.email || 'workspace'}`}
                alt={formData.fullName || roleLabel}
                className="h-28 w-28 rounded-3xl border border-border object-cover shadow-sm"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} isLoading={uploading}>
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>

            <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Shield className="h-4 w-4 text-primary" />
                  Workspace Role
                </div>
                <p className="mt-2 text-lg font-semibold text-text">{roleLabel}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4 text-primary" />
                  Contact
                </div>
                <p className="mt-2 text-lg font-semibold text-text">{formData.email || 'No email loaded'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Shield className="h-4 w-4 text-primary" />
                  Verification
                </div>
                <p className="mt-2 text-lg font-semibold text-text">{profile?.is_verified ? 'Verified' : 'Unverified'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Shield className="h-4 w-4 text-primary" />
                  Tutor Rating
                </div>
                <p className="mt-2 text-lg font-semibold text-text">
                  {ratings?.tutor_rating !== null && ratings?.tutor_rating !== undefined ? Number(ratings.tutor_rating).toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Shield className="h-4 w-4 text-primary" />
                  Student Rating
                </div>
                <p className="mt-2 text-lg font-semibold text-text">
                  {ratings?.student_rating !== null && ratings?.student_rating !== undefined ? Number(ratings.student_rating).toFixed(1) : 'N/A'}
                </p>
              </div>
              {stats && (
                <>
                  <div className="rounded-2xl border border-border bg-bg p-4">
                    <div className="text-sm font-medium text-text-muted">Enrollments</div>
                    <p className="mt-2 text-lg font-semibold text-text">{stats.totalEnrollments}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg p-4">
                    <div className="text-sm font-medium text-text-muted">Completed Courses</div>
                    <p className="mt-2 text-lg font-semibold text-text">{stats.completedCourses}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg p-4">
                    <div className="text-sm font-medium text-text-muted">Pending Balance</div>
                    <p className="mt-2 text-lg font-semibold text-text">₦{stats.pendingBalance.toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {children}

      <Card className="rounded-3xl bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-text">Backend Profile Details</CardTitle>
          <CardDescription className="text-text-muted">Read-only account fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">User ID</p><p className="mt-1 font-semibold text-text">{profile?.id ?? '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">Username</p><p className="mt-1 font-semibold text-text">{profile?.username || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">Role</p><p className="mt-1 font-semibold text-text">{profile?.role || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">User Category</p><p className="mt-1 font-semibold text-text">{profile?.user_category || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">Onboarding Fee</p><p className="mt-1 font-semibold text-text">{profile?.onboarding_fee !== null && profile?.onboarding_fee !== undefined ? String(profile.onboarding_fee) : '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">Referred By</p><p className="mt-1 font-semibold text-text">{profile?.referred_by || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">Active Referral Code</p><p className="mt-1 font-semibold text-text">{profile?.active_referral_code || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">LGA</p><p className="mt-1 font-semibold text-text">{profile?.lga || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">State</p><p className="mt-1 font-semibold text-text">{profile?.state || '-'}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-text-muted">Country</p><p className="mt-1 font-semibold text-text">{profile?.country || '-'}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl bg-surface border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-text">Account Details</CardTitle>
            <CardDescription className="text-text-muted">Role-owned profile controls for this workspace.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => setEditing((value) => !value)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-text">Full Name</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!editing} className="bg-bg border-border text-text" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!editing} className="bg-bg border-border text-text" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-text">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={!editing} className="bg-bg border-border text-text" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-text">Location</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} disabled={!editing} className="pl-10 bg-bg border-border text-text" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-text">Bio</Label>
              <Textarea id="bio" name="bio" rows={5} value={formData.bio} onChange={handleChange} disabled={!editing} className="bg-bg border-border text-text" />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={saving} disabled={!editing}>
                <Save className="h-4 w-4" />
                Save Profile
              </Button>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Phone className="h-4 w-4" />
                Contact and bio data are shared account-level profile fields.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceProfilePage;
