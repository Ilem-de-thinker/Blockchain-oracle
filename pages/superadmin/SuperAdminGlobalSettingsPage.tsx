import React, { useEffect, useState, useCallback } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Save, 
  RotateCcw,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import usersApi, { AppSetting } from '../../src/api/users';

const SuperAdminGlobalSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AppSetting | null>(null);
  const [newSetting, setNewSetting] = useState<Partial<AppSetting>>({
    key: '',
    value: '',
    description: ''
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleCreateSetting = async () => {
    if (!newSetting.key || !newSetting.value) {
      setError('Key and value are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await usersApi.createSetting({
        key: newSetting.key,
        value: newSetting.value,
        description: newSetting.description
      });
      setSuccess('Setting created successfully');
      setIsCreateOpen(false);
      setNewSetting({ key: '', value: '', description: '' });
      await loadSettings();
    } catch (err: any) {
      console.error('Failed to create setting:', err);
      setError(err.response?.data?.detail || 'Failed to create setting');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSetting = async () => {
    if (!editingSetting) return;

    try {
      setSaving(true);
      setError(null);
      await usersApi.updateSetting(
        editingSetting.key,
        editingSetting.value,
        editingSetting.description
      );
      setSuccess('Setting updated successfully');
      setIsEditOpen(false);
      setEditingSetting(null);
      await loadSettings();
    } catch (err: any) {
      console.error('Failed to update setting:', err);
      setError(err.response?.data?.detail || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (setting: AppSetting) => {
    setEditingSetting({ ...setting });
    setIsEditOpen(true);
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.key.split('_')[0].toUpperCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, AppSetting[]>);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      GENERAL: 'bg-blue-100 text-blue-700 border-blue-200',
      FEATURE: 'bg-purple-100 text-purple-700 border-purple-200',
      PAYMENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      FEE: 'bg-amber-100 text-amber-700 border-amber-200',
      REFERRAL: 'bg-pink-100 text-pink-700 border-pink-200',
      COURSE: 'bg-violet-100 text-violet-700 border-violet-200',
      DEFAULT: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || colors.DEFAULT;
  };

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div className={`rounded-lg p-4 ${
          error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          {error || success}
          <button 
            className="float-right text-sm underline" 
            onClick={() => { setError(null); setSuccess(null); }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Global Settings</h1>
          <p className="text-gray-500 mt-1">
            System-wide configuration parameters, feature flags, and platform constants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Setting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Setting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Key</label>
                  <Input
                    placeholder="e.g., REFERRAL_COMMISSION_RATE"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value.toUpperCase() })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Value</label>
                  <Input
                    placeholder="e.g., 0.10 or true"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                  <Input
                    placeholder="Describe what this setting controls"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSetting} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Setting'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-circle-notch fa-spin text-3xl text-purple-600"></i>
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <SettingsIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No global settings configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Platform settings will appear here once configured
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
                <Badge className={getCategoryColor(category)}>{category}</Badge>
              </div>
              <div className="divide-y divide-gray-50">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-bold text-gray-900 truncate">
                        {setting.key}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-lg font-semibold text-purple-600">
                          {typeof setting.value === 'object' 
                            ? JSON.stringify(setting.value) 
                            : String(setting.value)}
                        </p>
                      </div>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{setting.description}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-3"
                      onClick={() => openEditDialog(setting)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting: {editingSetting?.key}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Value</label>
              <Input
                value={editingSetting?.value || ''}
                onChange={(e) => setEditingSetting({ 
                  ...editingSetting!, 
                  value: e.target.value 
                })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input
                value={editingSetting?.description || ''}
                onChange={(e) => setEditingSetting({ 
                  ...editingSetting!, 
                  description: e.target.value 
                })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSetting} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Update Setting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminGlobalSettingsPage;