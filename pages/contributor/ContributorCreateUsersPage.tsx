import React, { useState, useCallback } from 'react';
import { User } from '../../types';
import { contributorApi } from '../../src/api/contributor';
import { getErrorMessage } from '../../src/api/errorHandler';
import { CheckCircle, AlertCircle, UserPlus, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ContributorCreateUsersPageProps {
  user: User | null;
}

interface UserFormData {
  full_name: string;
  email: string;
  role: string;
  lga: string;
  country: string;
}

const defaultFormData: UserFormData = {
  full_name: '',
  email: '',
  role: 'USER',
  lga: '',
  country: 'Nigeria',
};

const ContributorCreateUsersPage: React.FC<ContributorCreateUsersPageProps> = () => {
  const [usersList, setUsersList] = useLocalStorage<UserFormData[]>('contributor_create_users_list', [{ ...defaultFormData }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (index: number, field: keyof UserFormData, value: string) => {
    setUsersList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addUserRow = () => setUsersList(prev => [...prev, { ...defaultFormData }]);
  const removeUserRow = (index: number) => {
    if (usersList.length > 1) setUsersList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await contributorApi.bulkCreateUsers({ users: usersList.filter(u => u.full_name && u.email) });
      setResult(response);
      setUsersList([{ ...defaultFormData }]);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text text-sm">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bulk User Creation</h1>
            <p className="text-xs text-text-muted mt-1">Create multiple users and assign them to your network.</p>
          </div>
          <Button onClick={addUserRow} variant="outline" size="sm" className="h-8 text-xs">
            <Plus className="w-3 h-3 mr-1.5" /> Add Row
          </Button>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="border border-border rounded-lg overflow-hidden bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg text-text-muted border-b border-border uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Full Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">LGA</th>
                  <th className="px-4 py-3 font-semibold w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((u, i) => (
                  <tr key={i}>
                    <td className="p-2"><input value={u.full_name} onChange={e => handleInputChange(i, 'full_name', e.target.value)} className="w-full bg-transparent border border-border rounded px-2 py-1.5" placeholder="John Doe" /></td>
                    <td className="p-2"><input value={u.email} onChange={e => handleInputChange(i, 'email', e.target.value)} className="w-full bg-transparent border border-border rounded px-2 py-1.5" placeholder="john@example.com" /></td>
                    <td className="p-2"><input value={u.lga} onChange={e => handleInputChange(i, 'lga', e.target.value)} className="w-full bg-transparent border border-border rounded px-2 py-1.5" placeholder="LGA" /></td>
                    <td className="p-2 text-center">
                      <button type="button" onClick={() => removeUserRow(i)} className="text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="text-xs h-9">
              {loading ? 'Creating...' : 'Submit Users'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributorCreateUsersPage;
