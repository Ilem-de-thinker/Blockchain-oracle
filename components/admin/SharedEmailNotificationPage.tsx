import React, { useMemo, useState } from 'react';
import { Mail, RefreshCcw, Send, Users } from 'lucide-react';
import { notificationsApi, AdminEmailData } from '../../src/api/notifications';
import { getErrorMessage } from '../../src/api/errorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../src/hooks/useToast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SharedEmailNotificationPageProps {
  title?: string;
  subtitle?: string;
}

const emptyForm: AdminEmailData = {
  subject: '',
  message: '',
  user_ids: [],
  action_text: '',
  action_url: '',
};

const SharedEmailNotificationPage: React.FC<SharedEmailNotificationPageProps> = ({
  title = 'Send Email Notification',
  subtitle = 'Send styled HTML emails to all users or a targeted list.',
}) => {
  const toast = useToast();
  const [formData, setFormData] = useLocalStorage<AdminEmailData>('shared_email_notification_data', emptyForm);
  const [targetAllUsers, setTargetAllUsers] = useLocalStorage('shared_email_target_all', true);
  const [userIdsInput, setUserIdsInput] = useLocalStorage('shared_email_user_ids', '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedUserIds = useMemo(
    () =>
      userIdsInput
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id)),
    [userIdsInput]
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setTargetAllUsers(true);
    setUserIdsInput('');
    setError(null);
  };

  const clearPersistedData = () => {
    try {
      localStorage.removeItem('shared_email_notification_data');
      localStorage.removeItem('shared_email_target_all');
      localStorage.removeItem('shared_email_user_ids');
    } catch { /* ignore */ }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: AdminEmailData = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        action_text: formData.action_text?.trim() || undefined,
        action_url: formData.action_url?.trim() || undefined,
      };

      if (!payload.subject || !payload.message) {
        setError('Subject and message are required.');
        return;
      }

      if (!targetAllUsers) {
        if (parsedUserIds.length === 0) {
          setError('Enter at least one user ID or switch to all users.');
          return;
        }
        payload.user_ids = parsedUserIds;
      }

      const response = await notificationsApi.adminSendEmail(payload);
      toast.success(response.detail || 'Emails queued successfully.');
      resetForm();
    } catch (err: any) {
      const message = getErrorMessage(err) || 'Failed to send emails.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-sm text-text-muted">{subtitle}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={formData.subject} onChange={handleInputChange} placeholder="Email subject line" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={formData.message} onChange={handleInputChange} placeholder="Main content of the email" rows={8} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="action_text">CTA Text</Label>
                  <Input id="action_text" value={formData.action_text} onChange={handleInputChange} placeholder="View Dashboard" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action_url">CTA URL</Label>
                  <Input id="action_url" value={formData.action_url} onChange={handleInputChange} placeholder="https://example.com/dashboard" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface-alt/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="targetAllUsers" checked={targetAllUsers} onCheckedChange={(checked) => setTargetAllUsers(Boolean(checked))} />
                  <Label htmlFor="targetAllUsers" className="cursor-pointer">
                    Send to all users
                  </Label>
                </div>
                {!targetAllUsers && (
                  <div className="space-y-2">
                    <Label htmlFor="user_ids">Target User IDs</Label>
                    <Input id="user_ids" value={userIdsInput} onChange={(e) => setUserIdsInput(e.target.value)} placeholder="12, 15, 23" />
                    <p className="text-xs text-text-muted">Comma-separated IDs. Use this for controlled sends before a full broadcast.</p>
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button type="submit" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface-alt/30 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                <Users className="h-4 w-4" />
                {targetAllUsers ? 'All users' : `${parsedUserIds.length || 0} targeted users`}
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-text-muted">Subject</p>
                  <p className="font-semibold text-text">{formData.subject || '(No subject entered)'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Message</p>
                  <div className="whitespace-pre-wrap text-sm text-text-secondary">
                    {formData.message || '(No message entered)'}
                  </div>
                </div>
                {(formData.action_text || formData.action_url) && (
                  <div>
                    <p className="text-xs text-text-muted">Call to action</p>
                    <Button type="button" disabled className="mt-2">
                      {formData.action_text || 'Open Link'}
                    </Button>
                    {formData.action_url && <p className="mt-2 break-all text-xs text-text-muted">{formData.action_url}</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Email delivery starts immediately after submission. Use targeted sends for testing before broadcasting to all users.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedEmailNotificationPage;
