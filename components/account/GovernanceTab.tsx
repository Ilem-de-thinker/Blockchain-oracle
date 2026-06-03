import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2, Edit2, X, MonitorCog } from 'lucide-react';
import { usersApi, AppSetting } from '../../src/api/users';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const GovernanceTab: React.FC = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSetting, setNewSetting] = useState<AppSetting>({ key: '', value: '', description: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load global settings:', err);
      setError('Failed to load global settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: AppSetting) => {
    setEditingKey(setting.key);
    setEditValue(typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value));
    setEditDesc(setting.description || '');
  };

  const handleUpdate = async (key: string) => {
    try {
      setSaving(true);
      await usersApi.updateSetting(key, editValue, editDesc);
      setEditingKey(null);
      await loadSettings();
    } catch (err) {
      setError('Failed to update setting.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newSetting.key) return;
    try {
      setSaving(true);
      await usersApi.createSetting(newSetting);
      setIsAdding(false);
      setNewSetting({ key: '', value: '', description: '' });
      await loadSettings();
    } catch (err) {
      setError('Failed to create setting.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-500">Loading platform governance settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Global Settings</h2>
          <p className="text-sm text-gray-500">Manage system-wide parameters and feature flags.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Setting
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {isAdding && (
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">New Global Setting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  placeholder="Key (e.g. FEATURE_X_ENABLED)" 
                  value={newSetting.key}
                  onChange={e => setNewSetting({...newSetting, key: e.target.value})}
                />
                <Input 
                  placeholder="Value" 
                  value={newSetting.value as string}
                  onChange={e => setNewSetting({...newSetting, value: e.target.value})}
                />
              </div>
              <Textarea 
                placeholder="Description" 
                value={newSetting.description}
                onChange={e => setNewSetting({...newSetting, description: e.target.value})}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Setting'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {settings.map((setting) => (
          <Card key={setting.key} className="overflow-hidden">
            <CardContent className="p-0">
              {editingKey === setting.key ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-purple-600">{setting.key}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)} 
                      placeholder="Setting value"
                    />
                    <Textarea 
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                      placeholder="Setting description"
                    />
                    <Button size="sm" onClick={() => handleUpdate(setting.key)} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Update Setting'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">{setting.key}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {typeof setting.value === 'object' ? 'JSON' : 'String'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-purple-700">
                      {typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value)}
                    </p>
                    {setting.description && (
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(setting)} className="opacity-0 group-hover:opacity-100 lg:opacity-100">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {settings.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <MonitorCog className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-500">No global settings found.</p>
            <p className="text-xs text-gray-400 mt-1">Global feature flags and system constants will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernanceTab;
