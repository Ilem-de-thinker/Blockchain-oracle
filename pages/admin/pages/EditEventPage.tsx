import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import eventsApi, { CreateEventData } from '../../../src/api/events';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const typeOptions: Array<CreateEventData['type']> = ['webinar', 'workshop', 'conference', 'meetup'];

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [permissionChecked, setPermissionChecked] = useState(false);
  const DEFAULT_EVENT_FORM: CreateEventData = {
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 0,
    type: 'webinar',
    is_online: false,
    event_url: '',
  };

  const [formData, setFormData] = useLocalStorage<CreateEventData>(`edit_event_${id}_data`, DEFAULT_EVENT_FORM);
  const currentUser = React.useMemo(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as { id?: number | string; email?: string };
      return {
        id: parsed.id ? Number(parsed.id) : null,
        email: parsed.email?.toLowerCase() || null,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const event = await eventsApi.getEvent(parseInt(id, 10));
        if (!event) {
          setError('Event not found.');
          return;
        }

        const canManage =
          !!currentUser &&
          (
            (currentUser.id !== null &&
              (event.creator.id === currentUser.id || event.organizers.some((organizer) => organizer.id === currentUser.id))) ||
            (currentUser.email !== null &&
              (event.creator.email.toLowerCase() === currentUser.email ||
                event.organizers.some((organizer) => organizer.email.toLowerCase() === currentUser.email)))
          );

        if (!canManage) {
          setError('Only an event organizer can edit this event.');
          setPermissionChecked(true);
          setLoading(false);
          return;
        }

        setFormData(prev => {
          const isDefault = JSON.stringify(prev) === JSON.stringify(DEFAULT_EVENT_FORM);
          return isDefault
            ? {
                title: event.title,
                description: event.description,
                date: event.date.slice(0, 16),
                location: event.location || '',
                capacity: event.capacity,
                type: event.type,
                image_url: event.image_url,
                is_online: event.is_online,
                event_url: event.event_url || '',
              }
            : prev;
        });
        setPermissionChecked(true);
      } catch (err) {
        console.error('Failed to load event for edit:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await eventsApi.updateEvent(parseInt(id, 10), formData);
      setFormData(DEFAULT_EVENT_FORM);
      navigate(`${basePath}/events/${id}`);
    } catch (err: any) {
      console.error('Update event error:', err);
      setError(getErrorMessage(err) || 'Failed to update event');
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-3xl bg-surface p-8 text-sm text-text-muted shadow-sm">Loading event...</div>;
  if (permissionChecked && error && !formData.title) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        <button type="button" onClick={() => navigate(`${basePath}/events/${id}`)} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-gray-700">
          Back to Event
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-text">Edit Event</h1>
        <p className="mt-2 text-sm text-text-muted">Update event details in the current workspace.</p>
      </div>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Title<input name="title" value={formData.title} onChange={handleChange} required className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
          <label className="text-sm font-medium text-gray-700">Type<select name="type" value={formData.type} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm">{typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Date<input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
          <label className="text-sm font-medium text-gray-700">
            Event Format
            <select name="is_online" value={String(formData.is_online)} onChange={(e) => setFormData((prev) => ({ ...prev, is_online: e.target.value === 'true' }))} className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm">
              <option value="false">In person</option>
              <option value="true">Online</option>
            </select>
          </label>
          {formData.is_online ? (
            <label className="text-sm font-medium text-gray-700">Event URL<input name="event_url" value={formData.event_url || ''} onChange={handleChange} required className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
          ) : (
            <label className="text-sm font-medium text-gray-700">Location<input name="location" value={formData.location || ''} onChange={handleChange} required className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
          )}
          <label className="text-sm font-medium text-gray-700">Capacity<input type="number" name="capacity" value={formData.capacity || 0} onChange={handleChange} min="1" className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
          <label className="text-sm font-medium text-gray-700">Image URL<input name="image_url" value={formData.image_url || ''} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Description<textarea name="description" value={formData.description} onChange={handleChange} rows={5} required className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm" /></label>
        </div>
        <div className="mt-6 flex gap-3">
          <button disabled={saving} className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={() => navigate(`${basePath}/events/${id}`)} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
        </div>
      </div>
    </form>
  );
};

export default EditEventPage;
