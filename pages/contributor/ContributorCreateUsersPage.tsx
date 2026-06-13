import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { contributorApi } from '../../src/api/contributor';
import { getErrorMessage } from '../../src/api/errorHandler';
import { AlertCircle, Trash2, Plus, Users, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ContributorCreateUsersPageProps {
  user: User | null;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  age: string;
  lga: string;
  role: string;
  country: string;
}

const defaultFormData: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  age: '',
  lga: '',
  role: 'USER',
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
      const users = usersList
        .filter(u => (u.first_name || u.last_name) && u.email)
        .map(u => ({
          full_name: `${u.first_name} ${u.last_name}`.trim(),
          email: u.email,
          age: u.age ? parseInt(u.age) : undefined,
          role: u.role,
          lga: u.lga,
          country: u.country,
        }));
      const response = await contributorApi.bulkCreateUsers({ users });
      setResult(response);
      setUsersList([{ ...defaultFormData }]);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-bg text-text"
    >
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Contributor Workspace
              </p>
              <CardTitle className="mt-2 text-xl sm:text-2xl">
                Bulk User Creation
              </CardTitle>
              <p className="mt-1 text-sm text-text-muted">
                Create multiple users and assign them to your network. Each user gets a block form below.
              </p>
            </div>
            <Button onClick={addUserRow} variant="outline" className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </CardHeader>
        </Card>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">
            Successfully created {result.created_count || usersList.length} user(s)!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {usersList.map((u, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">User {i + 1}</CardTitle>
                </div>
                {usersList.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUserRow(i)}
                    className="h-8 w-8 text-text-muted hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`first_name_${i}`} size="sm">First Name</Label>
                    <Input
                      id={`first_name_${i}`}
                      value={u.first_name}
                      onChange={e => handleInputChange(i, 'first_name', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`last_name_${i}`} size="sm">Last Name</Label>
                    <Input
                      id={`last_name_${i}`}
                      value={u.last_name}
                      onChange={e => handleInputChange(i, 'last_name', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email_${i}`} size="sm">Email</Label>
                  <Input
                    id={`email_${i}`}
                    type="email"
                    value={u.email}
                    onChange={e => handleInputChange(i, 'email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`age_${i}`} size="sm">Age</Label>
                    <Input
                      id={`age_${i}`}
                      type="number"
                      value={u.age}
                      onChange={e => handleInputChange(i, 'age', e.target.value)}
                      placeholder="25"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lga_${i}`} size="sm">LGA</Label>
                    <Input
                      id={`lga_${i}`}
                      value={u.lga}
                      onChange={e => handleInputChange(i, 'lga', e.target.value)}
                      placeholder="LGA"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>Creating users...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit {usersList.length} User{usersList.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default ContributorCreateUsersPage;
