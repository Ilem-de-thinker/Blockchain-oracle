import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { authApi, ProfileData } from '@/src/api/auth';
import { coursesApi } from '@/src/api/courses';
import usersApi, { UserRatingProfile } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/errorHandler';
import countriesApi from '@/src/api/countries';
import { 
  Camera, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  RefreshCcw, 
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Trophy,
  Clock,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock4
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/components/ui/searchable-select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

// Helper to generate initials from full name
const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (str: string): string => {
  const colors = [
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red-500'
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const isAcademicallyCompleted = (enrollment: any) =>
  Boolean(enrollment?.is_course_completed ?? enrollment?.completed);

const ProfilePage: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useLocalStorage('profile_is_editing', false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [ratingProfile, setRatingProfile] = useState<UserRatingProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({ coursesCompleted: 0, learningTime: 0, certificates: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [statesList, setStatesList] = useState<{ name: string; state_code: string }[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const DEFAULT_PROFILE_FORM = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    lga: '',
    state: '',
    country: '',
    bio: '',
    profilePicture: '',
    referralCode: '',
    userCategory: '',
    onboardingFee: '',
    referredBy: '',
    isVerified: false,
  };

  const [formData, setFormData] = useLocalStorage('profile_form_data', DEFAULT_PROFILE_FORM);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await authApi.getProfile();
      setProfileData(profile);
      try {
        const rating = await usersApi.getUserRatingProfile(profile.id);
        setRatingProfile(rating);
      } catch {
        setRatingProfile(null);
      }

      const names = (profile.full_name || '').trim().split(/\s+/);
      setFormData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: profile.email || '',
        phone: profile.phone_number || '',
        address: profile.address || '',
        lga: profile.lga || '',
        state: profile.state || '',
        country: profile.country || '',
        bio: profile.bio || '',
        profilePicture: profile.profile_picture || '',
        referralCode: profile.active_referral_code || '',
        userCategory: profile.user_category || '',
        onboardingFee: profile.onboarding_fee === null || profile.onboarding_fee === undefined ? '' : String(profile.onboarding_fee),
        referredBy: profile.referred_by || '',
        isVerified: profile.is_verified || false,
      });
    } catch (err) {
      setError('Failed to load profile.');
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await coursesApi.getEnrollments();
      const enrollments = res.results || [];
      const completed = enrollments.filter((e: any) => isAcademicallyCompleted(e)).length;
      setStats({
        coursesCompleted: completed,
        learningTime: enrollments.length * 60,
        certificates: completed
      });
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const countries = await countriesApi.getCountries();
        setCountriesList(countries.map((c) => c.country).sort());
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    if (!formData.country) { setStatesList([]); return; }
    (async () => {
      setLoadingLocations(true);
      try {
        const states = await countriesApi.getStates(formData.country);
        setStatesList(states);
      } catch { setStatesList([]); }
      finally { setLoadingLocations(false); }
    })();
  }, [formData.country]);

  useEffect(() => {
    if (!formData.country || !formData.state) { setCitiesList([]); return; }
    (async () => {
      try {
        const cities = await countriesApi.getStateCities(formData.country, formData.state);
        setCitiesList(cities);
      } catch { setCitiesList([]); }
    })();
  }, [formData.country, formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const profilePictureUrl = await authApi.uploadProfilePicture(file);
      setFormData(prev => ({ ...prev, profilePicture: profilePictureUrl }));
      setProfileData((prev) => (prev ? { ...prev, profile_picture: profilePictureUrl } : prev));
      setSuccess('Picture updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err) || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.updateProfile({
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address,
        lga: formData.lga,
        state: formData.state,
        country: formData.country,
        bio: formData.bio,
      });
      setSuccess('Profile updated!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden px-1 sm:px-2 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">My Profile</h1>
          <p className="text-[10px] sm:text-xs text-text-muted">Personal info & settings</p>
        </div>
        {!formData.isVerified && (
          <Button 
            variant={isEditing ? "ghost" : "outline"} 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 text-[10px] font-bold uppercase tracking-wider"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        )}
        {formData.isVerified && (
          <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck size={14} />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold flex items-center gap-2">
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-xl">
        <div className="h-20 sm:h-28 bg-gradient-to-r from-primary to-primary-hover opacity-90" />
        
        <div className="px-4 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-10 sm:-mt-12 gap-3 sm:gap-4 mb-6">
            <div className="relative group">
              <div className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-surface shadow-xl overflow-hidden bg-gradient-to-br flex items-center justify-center ring-4 ring-offset-4 ring-offset-surface",
                formData.isVerified ? "ring-indigo-500" : getAvatarColor(formData.email)
              )}>
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-black">{getInitials(`${formData.firstName} ${formData.lastName}`)}</span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <RefreshCcw className="text-white animate-spin h-5 w-5" />
                  </div>
                )}
              </div>
              
              {/* Verification Badge - Twitter/X style rosette */}
              {formData.isVerified && (
                <span className="absolute -bottom-1 -right-1 block text-indigo-400 bg-surface rounded-full p-0.5 shadow-lg border-2 border-white/30" title="Verified Member">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.356.275C14.78 2.545 13.51 1.5 12 1.5c-1.51 0-2.78 1.045-3.416 2.285-.415-.175-.877-.275-1.356-.275-2.109 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.356-.275C9.22 21.455 10.49 22.5 12 22.5c1.51 0 2.78-1.045 3.416-2.285.415.175.877.275 1.356.275 2.109 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.23l-3.06-3.05 1.4-1.41 1.66 1.66 4.67-4.67 1.4 1.42-6.07 6.05z"/>
                  </svg>
                </span>
              )}
              
              {!formData.isVerified && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-surface border border-border rounded-lg shadow-lg flex items-center justify-center hover:bg-surface-alt transition-colors"
                >
                  <Camera size={14} className="text-text-muted" />
                </button>
              )}
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            
            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-text truncate">{formData.firstName} {formData.lastName}</h2>
                {formData.isVerified ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-1.5 py-0 h-4">Verified</Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[9px] font-black uppercase tracking-widest px-1.5 py-0 h-4">Unverified</Badge>
                )}
              </div>
              <p className="text-[11px] font-medium text-text-muted">{formData.email}</p>
            </div>
          </div>

          {/* Verification Section */}
          {!formData.isVerified && (
            <div className="mb-6 p-4 rounded-2xl border bg-red-500/[0.03] border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-100 text-red-600">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-text uppercase tracking-tight">Identity Unverified</h4>
                  <p className="text-[10px] text-text-muted font-medium">Complete your NIN verification to earn your badge and unlock all features.</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/dashboard/kyc')}
                className="w-full sm:w-auto h-9 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-primary text-white"
              >
                Verify Identity
              </Button>
            </div>
          )}

          {/* Referral Badge */}
          {formData.referralCode && (
            <div className="mb-6 p-3 rounded-xl bg-primary/[0.03] border border-primary/10 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Your Code</p>
                <p className="text-lg font-black text-text tracking-tighter">{formData.referralCode}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg text-[10px] font-black gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(formData.referralCode);
                  setSuccess('Copied!');
                  setTimeout(() => setSuccess(''), 2000);
                }}
              >
                <Copy size={12} /> Copy
              </Button>
            </div>
          )}

           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-text-muted uppercase px-1">First Name</label>
                 <Input 
                   name="firstName" value={formData.firstName} onChange={handleChange} 
                   disabled={!isEditing} className="h-9 text-xs rounded-xl" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-text-muted uppercase px-1">Last Name</label>
                 <Input 
                   name="lastName" value={formData.lastName} onChange={handleChange} 
                   disabled={!isEditing} className="h-9 text-xs rounded-xl" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-text-muted uppercase px-1">Email</label>
                 <Input 
                   name="email" value={formData.email} onChange={handleChange} 
                   disabled={!isEditing} className="h-9 text-xs rounded-xl" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-text-muted uppercase px-1">Phone Number</label>
                 <Input 
                   name="phone" value={formData.phone} onChange={handleChange} 
                   disabled={!isEditing} placeholder="+234..." className="h-9 text-xs rounded-xl" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-text-muted uppercase px-1">User Type</label>
                 <Input value={formData.userCategory || 'Student'} disabled className="h-9 text-xs rounded-xl bg-surface-alt" />
               </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase px-1">Country</label>
                  {isEditing ? (
                    <SearchableSelect
                      value={formData.country}
                      onChange={(val) => setFormData({ ...formData, country: val })}
                      options={countriesList.map((c) => ({ value: c, label: c }))}
                      placeholder="Select Country"
                      searchPlaceholder="Search countries..."
                      className="w-full"
                    />
                  ) : (
                    <Input name="country" value={formData.country} disabled className="h-9 text-xs rounded-xl" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase px-1">State</label>
                  {isEditing ? (
                    <SearchableSelect
                      value={formData.state}
                      onChange={(val) => setFormData({ ...formData, state: val })}
                      options={statesList.map((s) => ({ value: s.name, label: s.name }))}
                      placeholder="Select State"
                      searchPlaceholder="Search states..."
                      disabled={!formData.country}
                      loading={loadingLocations}
                      className="w-full"
                    />
                  ) : (
                    <Input name="state" value={formData.state} disabled className="h-9 text-xs rounded-xl" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase px-1">L.G.A / City</label>
                  {isEditing ? (
                    <SearchableSelect
                      value={formData.lga}
                      onChange={(val) => setFormData({ ...formData, lga: val })}
                      options={citiesList.map((c) => ({ value: c, label: c }))}
                      placeholder="Select LGA / City"
                      searchPlaceholder="Search cities..."
                      disabled={!formData.state || !formData.country}
                      className="w-full"
                    />
                  ) : (
                    <Input name="lga" value={formData.lga} disabled className="h-9 text-xs rounded-xl" />
                  )}
                </div>
             </div>
             
             <div className="space-y-1">
               <label className="text-[10px] font-black text-text-muted uppercase px-1">Address</label>
               <textarea
                 name="address" value={formData.address} onChange={handleChange}
                 disabled={!isEditing} rows={2}
                 className="w-full p-3 text-xs rounded-xl border border-border bg-surface outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                 placeholder="Enter your full address..."
               />
             </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase px-1">Bio</label>
              <textarea
                name="bio" value={formData.bio} onChange={handleChange}
                disabled={!isEditing} rows={2}
                className="w-full p-3 text-xs rounded-xl border border-border bg-surface outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="Tell us about yourself..."
              />
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button type="submit" disabled={isLoading} className="h-9 rounded-xl px-6 text-[11px] font-black uppercase tracking-wider text-white!">
                  {isLoading ? <RefreshCcw className="animate-spin h-4 w-4" /> : 'Save Profile'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <div className="bg-surface p-3 rounded-xl border border-border flex flex-col items-center text-center">
          <BookOpen size={16} className="text-primary mb-1" />
          <p className="text-sm font-black text-text">{stats.coursesCompleted}</p>
          <p className="text-[8px] font-bold text-text-muted uppercase truncate">Courses</p>
        </div>
        <div className="bg-surface p-3 rounded-xl border border-border flex flex-col items-center text-center">
          <Clock size={16} className="text-blue-500 mb-1" />
          <p className="text-sm font-black text-text">{Math.round(stats.learningTime / 60)}h</p>
          <p className="text-[8px] font-bold text-text-muted uppercase truncate">Learning</p>
        </div>
        <div className="bg-surface p-3 rounded-xl border border-border flex flex-col items-center text-center">
          <Trophy size={16} className="text-amber-500 mb-1" />
          <p className="text-sm font-black text-text">{stats.certificates}</p>
          <p className="text-[8px] font-bold text-text-muted uppercase truncate">Certificates</p>
        </div>
        <div className="bg-surface p-3 rounded-xl border border-border flex flex-col items-center text-center">
          <Trophy size={16} className="text-cyan-500 mb-1" />
          <p className="text-sm font-black text-text">
            {ratingProfile?.student_rating !== null && ratingProfile?.student_rating !== undefined
              ? Number(ratingProfile.student_rating).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-[8px] font-bold text-text-muted uppercase truncate">Student Rating</p>
        </div>
      </div>

      {ratingProfile && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-md hover:shadow-xl">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Ratings</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-alt/30 p-3">
              <p className="text-[10px] font-bold text-text-muted uppercase">Tutor Rating</p>
              <p className="mt-1 text-lg font-black text-text">
                {ratingProfile.tutor_rating !== null && ratingProfile.tutor_rating !== undefined
                  ? Number(ratingProfile.tutor_rating).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface-alt/30 p-3">
              <p className="text-[10px] font-bold text-text-muted uppercase">Student Rating</p>
              <p className="mt-1 text-lg font-black text-text">
                {ratingProfile.student_rating !== null && ratingProfile.student_rating !== undefined
                  ? Number(ratingProfile.student_rating).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
