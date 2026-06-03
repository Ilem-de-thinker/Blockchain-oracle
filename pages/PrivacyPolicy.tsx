import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: May 19, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Blo|&lt;ChainOracle ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform, including any associated courses, events, and services.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              By accessing or using our platform, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-medium text-gray-800 mb-2">Personal Information</h3>
            <p className="text-gray-600 leading-relaxed">
              We may collect personal information that you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>Register for an account (name, email address, phone number)</li>
              <li>Enroll in courses (payment information, billing details)</li>
              <li>Register for events (contact information, preferences)</li>
              <li>Contact our support team</li>
              <li>Subscribe to newsletters or marketing communications</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mb-2 mt-5">Automatically Collected Information</h3>
            <p className="text-gray-600 leading-relaxed">
              When you access our platform, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Course progress and completion data</li>
              <li>Quiz and assessment results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>To provide and maintain our educational platform</li>
              <li>To process enrollments, payments, and registrations</li>
              <li>To track your learning progress and issue certificates</li>
              <li>To communicate with you about courses, events, and platform updates</li>
              <li>To improve our services and develop new features</li>
              <li>To ensure platform security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payment Information</h2>
            <p className="text-gray-600 leading-relaxed">
              All payment processing is handled securely by third-party payment processors (Paystack). We do not store full payment card details on our servers. Payment transactions are encrypted and processed in compliance with PCI DSS standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li><strong>Service providers:</strong> Third-party vendors who help us operate our platform (payment processors, cloud hosting, analytics)</li>
              <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
              <li><strong>Course instructors:</strong> Limited information necessary for educational purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information, including encryption, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain data longer to comply with legal obligations or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal information</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise these rights, please contact us:
            </p>
            <ul className="list-none mt-2 text-gray-600 space-y-1">
              <li>Privacy: <a href="mailto:dev.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">dev.blockchainoracle@gmail.com</a></li>
              <li>General Inquiries: <a href="mailto:contact.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">contact.blockchainoracle@gmail.com</a></li>
              <li>Registrations: <a href="mailto:reg.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">reg.blockchainoracle@gmail.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Third-Party Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none mt-2 text-gray-600 space-y-1">
              <li>Privacy: <a href="mailto:dev.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">dev.blockchainoracle@gmail.com</a></li>
              <li>General Inquiries: <a href="mailto:contact.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">contact.blockchainoracle@gmail.com</a></li>
              <li>Registrations: <a href="mailto:reg.blockchainoracle@gmail.com" className="text-purple-600 hover:underline">reg.blockchainoracle@gmail.com</a></li>
              <li>Platform: <Link to="/" className="text-purple-600 hover:underline">Blo|&lt;Chain◯racle</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
