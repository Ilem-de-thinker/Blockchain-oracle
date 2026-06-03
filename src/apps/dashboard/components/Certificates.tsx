import React from 'react';
import { Link } from 'react-router-dom';

const Certificates: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Certificates</h1>
        <p className="text-text-muted mt-1">View and manage your earned certificates</p>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted">No certificates found. Certificates will appear here once you complete courses.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Certificates;
