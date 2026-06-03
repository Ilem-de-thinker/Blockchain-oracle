import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = 'mailto:contact.blockchainoracle@gmail.com';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-10">Have a question or need help? We'd love to hear from you.</p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea rows={5} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">General Inquiries</h3>
              <a href="mailto:contact.blockchainoracle@gmail.com" className="text-purple-600 hover:underline text-sm">contact.blockchainoracle@gmail.com</a>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Support</h3>
              <Link to="/login" className="text-purple-600 hover:underline text-sm">Open a support ticket</Link>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Partnerships</h3>
              <a href="mailto:dev.blockchainoracle@gmail.com" className="text-purple-600 hover:underline text-sm">dev.blockchainoracle@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
