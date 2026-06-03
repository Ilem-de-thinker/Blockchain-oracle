import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: May 19, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using BlockChainOracle ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all the terms, you may not access or use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Account Registration</h2>
            <p className="text-gray-600 leading-relaxed">
              You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate, complete, and current information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Course Enrollment and Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              Course fees are clearly displayed at the time of enrollment. Payments are processed securely through third-party processors. Refund policies are specified on each course page. We reserve the right to modify pricing with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on the Platform, including courses, materials, and software, is the property of BlockChainOracle or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree not to use the Platform for any unlawful purpose or in violation of these terms. Prohibited activities include harassing others, distributing malware, attempting to gain unauthorized access, and infringing on others' rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              The Platform is provided "as is" without warranties of any kind. BlockChainOracle shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms. You may terminate your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these terms, contact us at <a href="mailto:contact.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">contact.blockchainoracle@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
