import React from 'react';
import { Link } from 'react-router-dom';

const EnterprisePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-lg shadow-purple-200">
          <i className="fa-solid fa-building"></i>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Services</h1>
        <p className="text-gray-500 text-lg mb-4">
          Blockchain events, Web3 webinars, corporate training, and blockchain business consulting services for African enterprises.
        </p>
        <div className="text-left max-w-xl mx-auto mb-8 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Staffing &amp; Recruitment</h3>
              <p className="text-gray-500 text-xs mt-1">Sourcing and recruitment for blockchain roles including developers, analysts, and strategists.</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
              <i className="fas fa-chart-line"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Tokenomics Creation</h3>
              <p className="text-gray-500 text-xs mt-1">Economic modeling and tokenomics design for blockchain-based business models and projects.</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Business Development</h3>
              <p className="text-gray-500 text-xs mt-1">Partnership strategy and business development support for organizations adopting blockchain.</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
              <i className="fas fa-rocket"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Launch-to-Market Strategy</h3>
              <p className="text-gray-500 text-xs mt-1">Go-to-market planning and launch strategy for blockchain products targeting African and global markets.</p>
            </div>
          </div>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default EnterprisePage;
