import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white grid grid-cols-1 md:grid-cols-5 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:p-10 text-white md:col-span-2 flex flex-col justify-between">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-white transition-colors mb-6"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <span className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 bg-white/10 px-3 py-1 rounded-full w-fit">
                Get in touch
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                We'd love to hear from you
              </h2>
              <p className="mt-3 text-sm text-indigo-200 leading-relaxed">
                Have a question, feedback, or just want to say hello? Drop us a message and we'll get back to you within 24 hours.
              </p>
            </div>
            <div className="mt-10 hidden md:block">
              <svg className="w-48 h-auto mx-auto text-indigo-800/40" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="180" height="120" rx="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 50 L100 90 L190 50" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="50" cy="105" r="4" fill="currentColor" />
                <circle cx="100" cy="105" r="4" fill="currentColor" />
                <circle cx="150" cy="105" r="4" fill="currentColor" />
              </svg>
            </div>
          </div>

          <form className="p-8 md:p-10 md:col-span-3 space-y-6 bg-white" action="#" method="POST">
            <h3 className="text-lg font-semibold text-gray-900">Send us a message</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  First name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition border outline-none"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Last name
                </label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition border outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Your Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition border outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition border outline-none resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-5 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md shadow-indigo-500/10 transition-all transform active:scale-[0.98]"
              >
                Send Message
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
