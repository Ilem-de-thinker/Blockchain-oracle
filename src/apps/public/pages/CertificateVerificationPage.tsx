import React, { useState } from 'react';
import { motion } from 'framer-motion';
import certificatesApi from '@/src/api/certificates';

interface CertificateData {
  id: number;
  certificate_id: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    description?: string;
  };
  issued_at: string;
}

const CertificateVerificationPage: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setLoading(true);
    setError(null);
    setCertificate(null);
    setSearched(true);

    try {
      const data = await certificatesApi.verifyCertificate(certificateId.trim());
      setCertificate(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Certificate not found. Please check the certificate ID and try again.');
      } else {
        setError('An error occurred while verifying the certificate. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-certificate text-3xl text-purple-600"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Verify <span className="text-purple-600">Certificate</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Enter the unique certificate ID to verify its authenticity and view the certificate details.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8"
        >
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="certificateId" className="block text-sm font-bold text-gray-700 mb-2">
                Certificate ID
              </label>
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID (e.g., BLK-ORG-CERT-ABC123XYZ)"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !certificateId.trim()}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{
                  background: loading || !certificateId.trim() ? undefined : 'linear-gradient(to right, #7c3aed, #6d28d9)',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Certificate'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Error State */}
        {error && searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Verification Failed</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Success State */}
        {certificate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Verified Badge */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold">Certificate Verified</h3>
                  <p className="text-sm text-white/80">This certificate is authentic and valid</p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Certificate Holder
                    </h4>
                    <p className="text-xl font-bold text-gray-900">{certificate.user.full_name}</p>
                    <p className="text-sm text-gray-500">{certificate.user.email}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Course Completed
                    </h4>
                    <p className="text-lg font-bold text-gray-900">{certificate.course.title}</p>
                    {certificate.course.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{certificate.course.description}</p>
                    )}
                  </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Certificate ID
                    </h4>
                    <p className="text-sm font-mono bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-gray-700">
                      {certificate.certificate_id}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Issue Date
                    </h4>
                    <p className="text-gray-900 font-medium">{formatDate(certificate.issued_at)}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Issued By
                    </h4>
                    <p className="text-gray-900 font-medium">BlockchainOracle</p>
                  </div>
                </div>
              </div>


            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-4xl text-purple-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enter a Certificate ID</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              You can find the certificate ID on the certificate itself. It follows the format "BLK-ORG-CERT-XXXXXXXXX".
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
