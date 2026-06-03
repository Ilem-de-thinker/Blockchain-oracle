import React, { useEffect, useState } from 'react';
import { authApi } from '../../../src/api/auth';
import notificationsApi, { NotificationPreferences } from '../../../src/api/notifications';
import adminPaymentsApi from '../../../src/api/admin-payments';
import GovernanceTab from '../../../components/account/GovernanceTab';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ProfileForm {
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  bio: string;
}

const emptyPreferences: NotificationPreferences = {
  email_notifications: true,
  course_updates: true,
  event_reminders: true,
  marketing_emails: true,
  push_notifications: true,
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useLocalStorage<'workspace' | 'notifications' | 'payments' | 'system'>('admin_settings_tab', 'workspace');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    bio: '',
  });
  const [preferences, setPreferences] = useState<NotificationPreferences>(emptyPreferences);
  const [paymentStats, setPaymentStats] = useState<{total: number; count: number; avg: number} | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profile, prefs, txs] = await Promise.all([
          authApi.getProfile(),
          notificationsApi.getPreferences().catch(() => emptyPreferences),
          adminPaymentsApi.getAllTransactions(1, 100).catch(() => ({ results: [], count: 0 })),
        ]);

        setProfileForm({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone_number: profile.phone_number || '',
          address: profile.address || '',
          bio: profile.bio || '',
        });
        setPreferences(prefs);
        
        const txResults = txs.results || [];
        const totalAmount = txResults.reduce((sum, tx) => sum + tx.amount, 0);
        const successfulCount = txResults.filter(tx => tx.status === 'SUCCESS').length;
        setPaymentStats({
          total: totalAmount,
          count: txResults.length,
          avg: successfulCount > 0 ? Math.round(totalAmount / successfulCount) : 0,
        });
      } catch (loadError) {
        console.error('Failed to load admin settings:', loadError);
        setError('Failed to load admin settings from the backend.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      setMessage(null);
      setError(null);

      const updated = await authApi.updateProfile({
        full_name: profileForm.full_name,
        phone_number: profileForm.phone_number || undefined,
        address: profileForm.address || undefined,
        bio: profileForm.bio || undefined,
      });

      setProfileForm((prev) => ({
        ...prev,
        full_name: updated.full_name || '',
        email: updated.email || prev.email,
        phone_number: updated.phone_number || '',
        address: updated.address || '',
        bio: updated.bio || '',
      }));
      setMessage('Admin workspace profile updated.');
    } catch (saveError) {
      console.error('Failed to save admin profile:', saveError);
      setError('Failed to update workspace profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const updateNotificationPreference = async (
    updater: () => Promise<NotificationPreferences>,
    rollback: NotificationPreferences
  ) => {
    try {
      setSavingPrefs(true);
      const updated = await updater();
      setPreferences(updated);
      setMessage('Notification preferences updated.');
      setError(null);
    } catch (prefError) {
      console.error('Failed to update notification preferences:', prefError);
      setPreferences(rollback);
      setError('Failed to update notification preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleGlobalToggle = (field: 'email_notifications' | 'push_notifications', value: boolean) => {
    const previous = preferences;
    setPreferences({ ...preferences, [field]: value });
    updateNotificationPreference(() => notificationsApi.updatePreferences({ [field]: value }), previous);
  };

  const preferenceRows: Array<{
    key: 'course_updates' | 'event_reminders' | 'marketing_emails';
    label: string;
  }> = [
    { key: 'course_updates', label: 'Course updates' },
    { key: 'event_reminders', label: 'Event reminders' },
    { key: 'marketing_emails', label: 'Marketing emails' },
  ];

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: 'fa-user-shield' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'payments', label: 'Payments', icon: 'fa-credit-card' },
    { id: 'system', label: 'System', icon: 'fa-server' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">System Settings</h1>
        <p className="text-text-muted">Manage admin profile, notifications, and payment preferences.</p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-text-muted hover:text-gray-700 hover:border-border'
                  }
                `}
              >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center text-text-muted">
              <i className="fas fa-circle-notch fa-spin mr-3"></i>
              Loading settings...
            </div>
          ) : (
            <>
              {activeTab === 'workspace' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-text">Admin Workspace Profile</h3>
                    <div className="grid gap-4 max-w-3xl md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
                        <input name="full_name" value={profileForm.full_name} onChange={handleProfileChange} className="w-full rounded-xl border border-border px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input value={profileForm.email} disabled className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-text-muted" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
                        <input name="phone_number" value={profileForm.phone_number} onChange={handleProfileChange} className="w-full rounded-xl border border-border px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                        <input name="address" value={profileForm.address} onChange={handleProfileChange} className="w-full rounded-xl border border-border px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 max-w-3xl">
                      <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
                      <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows={4} className="w-full rounded-xl border border-border px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <button onClick={saveProfile} disabled={savingProfile} className="rounded-xl btn-primary px-6 py-2.5 text-white font-medium">
                      <i className={`fas ${savingProfile ? 'fa-circle-notch fa-spin' : 'fa-save'} mr-2`}></i>
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-text">Notification Delivery</h3>
                    <div className="grid gap-4 max-w-3xl md:grid-cols-3">
                      {[
                        ['email_notifications', 'Email notifications'],
                        ['push_notifications', 'Push notifications'],
                      ].map(([field, label]) => (
                        <label key={field} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <input
                            type="checkbox"
                            checked={preferences[field as keyof Pick<NotificationPreferences, 'email_notifications' | 'push_notifications'>]}
                            onChange={(e) => handleGlobalToggle(field as 'email_notifications' | 'push_notifications', e.target.checked)}
                            className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 max-w-4xl md:grid-cols-2">
                    {preferenceRows.map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <input
                          type="checkbox"
                          checked={preferences[key]}
                          onChange={(e) => {
                            const previous = preferences;
                            setPreferences({ ...preferences, [key]: e.target.checked });
                            updateNotificationPreference(
                              () => notificationsApi.updatePreferences({ [key]: e.target.checked }),
                              previous
                            );
                          }}
                          className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                    ))}
                  </div>

                  {savingPrefs && <p className="text-sm text-text-muted">Saving notification preferences...</p>}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-text">Transactions Snapshot</h3>
                    <p className="text-sm text-text-muted">Read-only transaction summary values.</p>
                  </div>
                  {paymentStats ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-border p-4">
                        <p className="text-sm text-text-muted">Total amount</p>
                        <p className="mt-2 text-2xl font-bold text-text">${paymentStats.total}</p>
                      </div>
                      <div className="rounded-xl border border-border p-4">
                        <p className="text-sm text-text-muted">Transactions</p>
                        <p className="mt-2 text-2xl font-bold text-text">{paymentStats.count}</p>
                      </div>
                      <div className="rounded-xl border border-border p-4">
                        <p className="text-sm text-text-muted">Average order</p>
                        <p className="mt-2 text-2xl font-bold text-text">${paymentStats.avg}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      No transaction data available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-800 mb-4">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Platform Governance: Manage system-wide parameters and feature flags.
                  </div>
                  <GovernanceTab />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
