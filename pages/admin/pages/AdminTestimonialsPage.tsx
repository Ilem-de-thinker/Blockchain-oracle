import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar_url: string;
  content: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

const AdminTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar_url: '',
    content: '',
    rating: 5,
    is_featured: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('cms_testimonials');
    if (stored) setTestimonials(JSON.parse(stored));
    setLoading(false);
  }, []);

  const saveTestimonials = (updated: Testimonial[]) => {
    setTestimonials(updated);
    localStorage.setItem('cms_testimonials', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTestimonial: Testimonial = {
      id: Date.now(),
      name: formData.name,
      role: formData.role,
      avatar_url: formData.avatar_url,
      content: formData.content,
      rating: formData.rating,
      is_featured: formData.is_featured,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    saveTestimonials([newTestimonial, ...testimonials]);
    setFormData({ name: '', role: '', avatar_url: '', content: '', rating: 5, is_featured: false });
    setShowForm(false);
  };

  const deleteTestimonial = (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    saveTestimonials(testimonials.filter((t) => t.id !== id));
  };

  const toggleFeatured = (t: Testimonial) => {
    saveTestimonials(testimonials.map((item) =>
      item.id === t.id ? { ...item, is_featured: !item.is_featured } : item
    ));
  };

  const toggleActive = (t: Testimonial) => {
    saveTestimonials(testimonials.map((item) =>
      item.id === t.id ? { ...item, is_active: !item.is_active } : item
    ));
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <i key={star} className={`fas fa-star text-xs ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-3xl text-emerald-600"></i>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Testimonials Management</h1>
          <p className="text-sm text-text-muted">Manage student and user testimonials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>{showForm ? 'Cancel' : 'New Testimonial'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="testimonial-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  id="testimonial-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="testimonial-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  id="testimonial-role"
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Student, Developer"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="testimonial-avatar" className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input
                id="testimonial-avatar"
                type="text"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="testimonial-content" className="block text-sm font-medium text-gray-700 mb-1">Testimonial</label>
              <textarea
                id="testimonial-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <i className={`fas fa-star text-lg ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                Featured
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-gray-700 text-sm font-medium hover:bg-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                Add Testimonial
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className={`bg-surface rounded-xl border border-border p-5 ${!t.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-emerald-700">{t.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text">{t.name}</h3>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.is_featured && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        <i className="fas fa-star mr-1"></i>Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-3 line-clamp-3">{t.content}</p>
            <div className="flex items-center justify-between">
              {renderStars(t.rating)}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFeatured(t)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                  title={t.is_featured ? 'Remove Featured' : 'Mark Featured'}
                >
                  <i className="fas fa-star text-xs"></i>
                </button>
                <button
                  onClick={() => toggleActive(t)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title={t.is_active ? 'Deactivate' : 'Activate'}
                >
                  <i className={`fas ${t.is_active ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                </button>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-quote-right text-gray-400 text-lg"></i>
          </div>
          <p className="text-sm font-medium text-text">No testimonials yet</p>
          <p className="text-xs text-text-muted mt-1">Add testimonials to showcase user experiences.</p>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonialsPage;
