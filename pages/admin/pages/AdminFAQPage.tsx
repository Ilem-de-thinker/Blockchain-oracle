import React, { useState, useEffect } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_active: boolean;
}

const AdminFAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('cms_faqs');
    if (stored) {
      setFaqs(JSON.parse(stored));
    } else {
      const defaults: FAQItem[] = [
        { id: 1, question: 'What is Blockchain Oracle?', answer: 'Blockchain Oracle is a learning platform for blockchain technology courses, events, and certifications.', category: 'General', order: 1, is_active: true },
        { id: 2, question: 'How do I enroll in a course?', answer: 'Browse the course catalog, select a course, and click Enroll. For paid courses, you will be directed to checkout.', category: 'Courses', order: 2, is_active: true },
        { id: 3, question: 'What payment methods are accepted?', answer: 'We accept credit/debit cards, PayPal, and cryptocurrency payments.', category: 'Payments', order: 3, is_active: true },
      ];
      setFaqs(defaults);
      localStorage.setItem('cms_faqs', JSON.stringify(defaults));
    }
    setLoading(false);
  }, []);

  const saveFaqs = (updated: FAQItem[]) => {
    setFaqs(updated);
    localStorage.setItem('cms_faqs', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFaq: FAQItem = {
      id: Date.now(),
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
      order: formData.order || faqs.length + 1,
      is_active: true,
    };
    saveFaqs([...faqs, newFaq]);
    setFormData({ question: '', answer: '', category: 'General', order: 0 });
    setShowForm(false);
  };

  const deleteFaq = (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    saveFaqs(faqs.filter((f) => f.id !== id));
  };

  const toggleActive = (faq: FAQItem) => {
    saveFaqs(faqs.map((f) => f.id === faq.id ? { ...f, is_active: !f.is_active } : f));
  };

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];
  const [filterCategory, setFilterCategory] = useState('All');
  const filteredFaqs = filterCategory === 'All' ? faqs : faqs.filter((f) => f.category === filterCategory);

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
          <h1 className="text-xl font-bold text-text">FAQ Management</h1>
          <p className="text-sm text-text-muted">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>{showForm ? 'Cancel' : 'New FAQ'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="faq-question" className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                id="faq-question"
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="faq-answer" className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                id="faq-answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="faq-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  id="faq-category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="faq-order" className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  id="faq-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
                Create FAQ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-surface border border-border text-gray-700 hover:bg-bg'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredFaqs.map((faq) => (
          <div key={faq.id} className={`bg-surface rounded-xl border border-border p-4 ${!faq.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-text">{faq.question}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                    {faq.category}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(faq)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title={faq.is_active ? 'Deactivate' : 'Activate'}
                >
                  <i className={`fas ${faq.is_active ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                </button>
                <button
                  onClick={() => deleteFaq(faq.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredFaqs.length === 0 && (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-question-circle text-gray-400 text-lg"></i>
            </div>
            <p className="text-sm font-medium text-text">No FAQs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFAQPage;
