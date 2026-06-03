import React, { useState, useEffect } from 'react';
import { uploadApi } from '../../../src/api/upload';

import { ReportActions } from '../../../components/ui/ReportActions';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    const stored = localStorage.getItem('cms_blog_posts');
    if (stored) setPosts(JSON.parse(stored));
    setLoading(false);
  }, []);

  const savePosts = (updated: BlogPost[]) => {
    setPosts(updated);
    localStorage.setItem('cms_blog_posts', JSON.stringify(updated));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const url = await uploadApi.uploadThumbnail(file);
      setFormData((prev) => ({ ...prev, featured_image: url }));
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      const newPost: BlogPost = {
        id: Date.now(),
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt: formData.excerpt,
        content: formData.content,
        author: 'Admin',
        featured_image: formData.featured_image,
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      savePosts([newPost, ...posts]);
      setFormData({ title: '', excerpt: '', content: '', featured_image: '', status: 'draft' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = (id: number) => {
    if (!confirm('Delete this post?')) return;
    savePosts(posts.filter((p) => p.id !== id));
  };

  const toggleStatus = (post: BlogPost) => {
    const updated = posts.map((p) =>
      p.id === post.id ? { ...p, status: p.status === 'draft' ? 'published' as const : 'draft' as const, updated_at: new Date().toISOString() } : p
    );
    savePosts(updated);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-3xl text-emerald-600"></i>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <strong>Local Storage Mode:</strong> Blog posts are stored locally in your browser.
        Backend API integration is required for production use. Images are uploaded to Cloudinary.
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">Blog Management</h1>
          <p className="text-sm text-text-muted">Create and manage blog posts (local storage)</p>
        </div>
        <div className="flex items-center gap-3">
          <ReportActions />
          <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>{showForm ? 'Cancel' : 'New Post'}
        </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="blog-title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                id="blog-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="blog-excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <input
                id="blog-excerpt"
                type="text"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="blog-image" className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
              <div className="flex gap-2">
                <input
                  id="blog-image"
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://... or upload below"
                  className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <label className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium text-text-secondary hover:bg-gray-200 cursor-pointer flex items-center gap-2">
                  {uploadingImage ? (
                    <><i className="fas fa-circle-notch fa-spin"></i>Uploading...</>
                  ) : (
                    <><i className="fas fa-upload"></i>Upload</>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
              </div>
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt="Preview"
                  className="mt-2 h-32 w-auto rounded-lg object-cover"
                />
              )}
            </div>
            <div>
              <label htmlFor="blog-content" className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                id="blog-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-border text-gray-700 text-sm font-medium hover:bg-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? <><i className="fas fa-circle-notch fa-spin mr-2"></i>Creating...</> : 'Create Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-bg transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text">{post.title}</p>
                    <p className="text-xs text-text-muted truncate max-w-xs">{post.excerpt || 'No excerpt'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{new Date(post.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(post)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title={post.status === 'draft' ? 'Publish' : 'Unpublish'}
                      >
                        <i className={`fas ${post.status === 'draft' ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-newspaper text-gray-400 text-lg"></i>
            </div>
            <p className="text-sm font-medium text-text">No blog posts yet</p>
            <p className="text-xs text-text-muted mt-1">Create your first blog post to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogPage;