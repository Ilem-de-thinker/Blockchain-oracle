import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Loader2, Lock, MonitorCog, SunMedium, UserRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { authApi } from '../../src/api/auth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import notificationsApi, { NotificationPreferences, UpdatePreferencesData } from '../../src/api/notifications';
import GovernanceTab from './GovernanceTab';

interface WorkspaceSettingsPageProps {
  roleLabel: string;
  heading: string;
  description: string;
  showGovernance?: boolean;
}

interface ProfileForm {
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  lga: string;
  state: string;
  country: string;
  bio: string;
}

interface SecurityForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
  delete_confirmation: string;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  course_updates: true,
  event_reminders: true,
  marketing_emails: true,
  push_notifications: true,
};

const WorkspaceSettingsPage: React.FC<WorkspaceSettingsPageProps> = ({
  roleLabel,
  heading,
  description,
  showGovernance = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useLocalStorage<'account' | 'security' | 'notifications' | 'governance'>('workspace_settings_tab', 'account');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    lga: '',
    state: '',
    country: '',
    bio: '',
  });
  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    current_password: '',
    new_password: '',
    confirm_password: '',
    delete_confirmation: '',
  });
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profile, prefs] = await Promise.all([
          authApi.getProfile(),
          notificationsApi.getPreferences().catch(() => defaultPreferences),
        ]);

        setProfileForm({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone_number: profile.phone_number || '',
          address: profile.address || '',
          lga: profile.lga || '',
          state: profile.state || '',
          country: profile.country || '',
          bio: profile.bio || '',
        });
        setPreferences(prefs);
      } catch (loadError) {
        console.error('Failed to load workspace settings:', loadError);
        setError('Failed to load workspace settings from the backend.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const notificationRows = useMemo(
    () => [
      { key: 'course_updates', label: 'Course updates', description: 'Publishing, enrollment, and learning content updates.' },
      { key: 'event_reminders', label: 'Event reminders', description: 'Schedule changes, registrations, and session reminders.' },
      { key: 'marketing_emails', label: 'Marketing emails', description: 'Product launches, announcements, and promotional updates.' },
    ] as const,
    []
  );

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSecurityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      setMessage(null);
      setError(null);

      const updated = await authApi.updateProfile({
        full_name: profileForm.full_name,
        phone_number: profileForm.phone_number || undefined,
        address: profileForm.address || undefined,
        lga: profileForm.lga || undefined,
        state: profileForm.state || undefined,
        country: profileForm.country || undefined,
        bio: profileForm.bio || undefined,
      });

      setProfileForm((prev) => ({
        ...prev,
        full_name: updated.full_name || '',
        email: updated.email || prev.email,
        phone_number: updated.phone_number || '',
        address: updated.address || '',
        lga: updated.lga || '',
        state: updated.state || '',
        country: updated.country || '',
        bio: updated.bio || '',
      }));
      setMessage('Workspace profile updated.');
    } catch (saveError) {
      console.error('Failed to save workspace profile:', saveError);
      setError('Failed to update workspace profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePreference = (
    next: UpdatePreferencesData | NotificationPreferences
  ) => setPreferences((next as NotificationPreferences) || defaultPreferences);

  const handleGlobalPreferenceChange = async (
    field: 'email_notifications' | 'push_notifications',
    value: boolean
  ) => {
    const nextPrefs: NotificationPreferences = { ...preferences, [field]: value };
    setPreferences(nextPrefs);
    try {
      setSavingPrefs(true);
      const updated = await notificationsApi.updatePreferences({ [field]: value });
      updatePreference(updated);
      setMessage('Notification preferences updated.');
    } catch (prefError) {
      console.error('Failed to update notification preferences:', prefError);
      setPreferences(preferences);
      setError('Failed to update notification preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleTypePreferenceChange = async (
    field: 'course_updates' | 'event_reminders' | 'marketing_emails',
    value: boolean
  ) => {
    const nextPrefs: NotificationPreferences = {
      ...preferences,
      [field]: value,
    };
    setPreferences(nextPrefs);

    try {
      setSavingPrefs(true);
      const updated = await notificationsApi.updatePreferences({ [field]: value });
      updatePreference(updated);
      setMessage('Notification preferences updated.');
    } catch (prefError) {
      console.error('Failed to update notification type preference:', prefError);
      setPreferences(preferences);
      setError('Failed to update notification preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityForm.current_password || !securityForm.new_password) {
      setError('Current and new password are required.');
      return;
    }

    if (securityForm.new_password !== securityForm.confirm_password) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      setSavingSecurity(true);
      setMessage(null);
      setError(null);
      const response = await authApi.changePassword({
        current_password: securityForm.current_password,
        new_password: securityForm.new_password,
      });
      setSecurityForm((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
      setMessage(response.message || 'Password changed successfully.');
    } catch (securityError) {
      console.error('Failed to change password:', securityError);
      setError('Failed to change password.');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleDeleteAccount = async () => {
    const expectedConfirmation = roleLabel.toUpperCase();
    if (securityForm.delete_confirmation.trim().toUpperCase() !== expectedConfirmation) {
      setError(`Type ${expectedConfirmation} to confirm account deletion.`);
      return;
    }

    try {
      setDeletingAccount(true);
      setMessage(null);
      setError(null);
      await authApi.deleteAccount();
      await authApi.logout();
      navigate('/login');
    } catch (deleteError) {
      console.error('Failed to delete account:', deleteError);
      setError('Failed to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <MonitorCog className="h-6 w-6 text-purple-500" />
            {heading}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid h-auto w-full grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ['account', 'Workspace'],
          ['security', 'Security'],
          ['notifications', 'Notifications'],
          ...(showGovernance ? [['governance', 'Governance']] : []),
        ].map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={activeTab === value ? 'bg-purple-500' : 'outline'}
            className="justify-center"
            onClick={() => setActiveTab(value as typeof activeTab)}
          >
            {label}
          </Button>
        ))}
      </div>

      {activeTab === 'account' && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-purple-500" />
              {roleLabel} Profile
            </CardTitle>
            <CardDescription>Manage your workspace account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile...
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Full name</label>
                    <Input name="full_name" value={profileForm.full_name} onChange={handleProfileChange} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                    <Input name="email" value={profileForm.email} disabled />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Phone number</label>
                    <Input name="phone_number" value={profileForm.phone_number} onChange={handleProfileChange} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
                    <Input name="address" value={profileForm.address} onChange={handleProfileChange} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">LGA</label>
                    <Input name="lga" value={profileForm.lga} onChange={handleProfileChange} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
                    <Input name="state" value={profileForm.state} onChange={handleProfileChange} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
                    <Input name="country" value={profileForm.country} onChange={handleProfileChange} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
                  <Textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows={5} />
                </div>
                <Button type="button" onClick={handleProfileSave} disabled={savingProfile} className='text-white'>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Security
            </CardTitle>
            <CardDescription>Update your password and account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Changing your password updates your login credentials immediately. Deleting your account permanently removes access and signs you out.
            </div>

            <div className="rounded-3xl border border-gray-200 p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-500">Use your current password to rotate your account credentials.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Current password</label>
                  <Input
                    name="current_password"
                    type="password"
                    value={securityForm.current_password}
                    onChange={handleSecurityChange}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">New password</label>
                  <Input
                    name="new_password"
                    type="password"
                    value={securityForm.new_password}
                    onChange={handleSecurityChange}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Confirm new password</label>
                  <Input
                    name="confirm_password"
                    type="password"
                    value={securityForm.confirm_password}
                    onChange={handleSecurityChange}
                  />
                </div>
              </div>
              <Button type="button" className="mt-4 w-full sm:w-auto text-white" onClick={handleChangePassword} disabled={savingSecurity}>
                {savingSecurity ? 'Updating password...' : 'Update password'}
              </Button>
            </div>

            <div className="rounded-3xl border border-red-200 bg-red-50/60 p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-red-700">Delete Account</h3>
                <p className="text-xs text-red-600">
                  This permanently removes your authenticated account. Type <strong>{roleLabel.toUpperCase()}</strong> to confirm.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-red-700">Confirmation text</label>
                  <Input
                    name="delete_confirmation"
                    value={securityForm.delete_confirmation}
                    onChange={handleSecurityChange}
                    className="border-red-200 bg-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? 'Deleting account...' : 'Delete account'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Notifications
            </CardTitle>
            <CardDescription>Choose how and when you receive updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading notification preferences...
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Switch checked={preferences.email_notifications} onCheckedChange={(value) => handleGlobalPreferenceChange('email_notifications', value)} label="Email notifications" />
                  <Switch checked={preferences.push_notifications} onCheckedChange={(value) => handleGlobalPreferenceChange('push_notifications', value)} label="Push notifications" />
                </div>

                <div className="space-y-4">
                  {notificationRows.map((row) => (
                    <div key={row.key} className="rounded-2xl border border-gray-200 p-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">{row.label}</h3>
                        <p className="text-sm text-gray-500">{row.description}</p>
                      </div>
                      <Switch
                        checked={preferences[row.key]}
                        onCheckedChange={(value) => handleTypePreferenceChange(row.key, value)}
                        label={row.label}
                      />
                    </div>
                  ))}
                </div>

                {savingPrefs && <p className="text-sm text-gray-500">Saving notification preferences...</p>}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'governance' && showGovernance && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-500" />
              Platform Governance
            </CardTitle>
            <CardDescription>Manage global settings, feature controls, and system behavior.</CardDescription>
          </CardHeader>
          <CardContent>
            <GovernanceTab />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkspaceSettingsPage;
