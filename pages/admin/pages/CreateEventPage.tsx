import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import eventsApi, { CreateEventData } from '../../../src/api/events';
import { usersApi, User } from '../../../src/api/users';
import { uploadApi } from '../../../src/api/upload';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { 
  Plus, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Globe, 
  Users, 
  DollarSign, 
  ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const typeOptions: Array<CreateEventData['type']> = ['webinar', 'workshop', 'conference', 'meetup'];

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [tutors, setTutors] = useState<User[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';
  
  const workspaceLabel = basePath === '/tutor' ? 'Tutor' : basePath === '/super-admin' ? 'Super Admin' : 'Admin';

  const DEFAULT_EVENT_FORM: CreateEventData = {
    title: '',
    description: '',
    date: '',
    is_online: false,
    event_url: '',
    location: '',
    organizer_ids: [],
    image_url: '',
    registration_fee: 0,
    event_fee: 0,
    capacity: 100,
    type: 'webinar',
  };

  const [formData, setFormData] = useLocalStorage<CreateEventData>('create_event_data', DEFAULT_EVENT_FORM);

  useEffect(() => {
    const fetchTutors = async () => {
      if (basePath === '/tutor') return;
      setLoadingTutors(true);
      try {
        const response = await usersApi.getTutors(1, '');
        setTutors(response.results);
      } catch (err) {
        console.error('Failed to fetch tutors:', err);
      } finally {
        setLoadingTutors(false);
      }
    };
    fetchTutors();
  }, [basePath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const val = type === 'number' ? Number(value) : value;
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadApi.uploadThumbnail(file);
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOrganizerToggle = (tutorId: number) => {
    setFormData(prev => {
      const current = prev.organizer_ids || [];
      if (current.includes(tutorId)) {
        return { ...prev, organizer_ids: current.filter(id => id !== tutorId) };
      } else {
        return { ...prev, organizer_ids: [...current, tutorId] };
      }
    });
  };

  const pricing = useMemo(() => {
    const reg = Number(formData.registration_fee || 0);
    const event = Number(formData.event_fee || 0);
    return {
      total: reg + event,
      isFree: (reg + event) === 0
    };
  }, [formData.registration_fee, formData.event_fee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!formData.is_online && !formData.location?.trim()) {
      setError('Physical events must have a location.');
      return;
    }
    if (formData.is_online && !formData.event_url?.trim()) {
      setError('Online events must have an event URL.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // API expects ISO string for date
      const payload = { ...formData };
      if (payload.is_online) {
        payload.location = undefined;
      } else {
        payload.event_url = undefined;
      }

      const created = await eventsApi.createEvent(payload);
      setFormData(DEFAULT_EVENT_FORM);
      navigate(`${basePath}/events`);
    } catch (err: any) {
      console.error('Create event error:', err);
      setError(getErrorMessage(err) || 'Failed to create event');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">{workspaceLabel} Events</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Create Event</h1>
            <p className="mt-2 text-sm text-text-muted">Schedule and configure a new platform event.</p>
          </div>
          <Button variant="outline" onClick={() => navigate(`${basePath}/events`)} className="border-border/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Event Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">Event Title</label>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. African Blockchain Summit 2026" 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Event Type</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Capacity</label>
                <Input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleChange} 
                  min="1" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">Description</label>
                <Textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={6} 
                  placeholder="What is this event about? What will attendees learn?" 
                />
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Logistics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">Date & Time</label>
                <Input 
                  type="datetime-local" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-6 p-4 rounded-xl border border-border/30 bg-primary/5 mb-4">
                  <label className="flex items-center gap-3 text-sm font-medium text-text cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_online"
                      checked={formData.is_online}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-border/50 text-purple-600"
                    />
                    Online Event
                  </label>
                </div>
              </div>
              {formData.is_online ? (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-text">Event URL (Zoom, Google Meet, etc.)</label>
                  <Input 
                    name="event_url" 
                    value={formData.event_url} 
                    onChange={handleChange} 
                    placeholder="https://zoom.us/j/..." 
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-text">Physical Location</label>
                  <Input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder="e.g. Civic Centre, Victoria Island, Lagos" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Organizers (Only for Admins) */}
          {basePath !== '/tutor' && (
            <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text mb-4">Assign Organizers</h2>
              <div className="space-y-4">
                <p className="text-sm text-text-muted">Select tutors to co-organize this event.</p>
                {loadingTutors ? (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tutors...
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {tutors.map(tutor => (
                      <button
                        key={tutor.id}
                        type="button"
                        onClick={() => handleOrganizerToggle(tutor.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                          formData.organizer_ids?.includes(tutor.id)
                            ? "border-purple-600 bg-purple-50"
                            : "border-border/30 hover:border-border/60 bg-surface/50"
                        )}
                      >
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                          {tutor.profile_picture ? (
                            <img src={tutor.profile_picture} alt={tutor.full_name} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text truncate">{tutor.full_name}</p>
                          <p className="text-xs text-text-muted truncate">{tutor.email}</p>
                        </div>
                        {formData.organizer_ids?.includes(tutor.id) && (
                          <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Event Cover Image</h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full text-sm text-text-muted file:mr-4 file:rounded-lg file:border file:border-border/50 file:bg-surface/80 file:px-4 file:py-2"
              />
              {uploadingImage && <div className="flex items-center gap-2 text-sm text-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>}
              {formData.image_url ? (
                <img src={formData.image_url} alt="Cover" className="h-48 w-full rounded-xl object-cover border border-border/30" />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/30 bg-primary/5 text-sm text-text-muted">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Registration Fee ($)</label>
                <Input 
                  type="number" 
                  name="registration_fee" 
                  value={formData.registration_fee} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01" 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Event Main Fee ($)</label>
                <Input 
                  type="number" 
                  name="event_fee" 
                  value={formData.event_fee} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01" 
                />
              </div>
              <div className="p-4 rounded-xl border border-border/30 bg-purple-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-text">Total Price</span>
                  <span className={cn(
                    "text-xl font-black",
                    pricing.isFree ? "text-emerald-600" : "text-purple-600"
                  )}>
                    {pricing.isFree ? 'FREE' : `$${pricing.total.toFixed(2)}`}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  {pricing.isFree ? 'Instant registration for users' : 'Requires Paystack payment'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
              isLoading={saving}
            >
              Create Event
            </Button>
            <p className="mt-4 text-center text-xs text-text-muted">
              By creating this event, you'll be listed as the primary organizer and it will be visible in the events catalog once published.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
