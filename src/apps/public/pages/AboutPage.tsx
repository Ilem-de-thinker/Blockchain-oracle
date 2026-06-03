import React from "react";
import { Link } from "react-router-dom";

const platform_name = "Bloc|<ChainOracle";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About {platform_name}
        </h1>

        <div className="space-y-8">
          <section>
            <p className="text-gray-600 leading-relaxed">
              In Nigeria and much of Africa, technological transitions often happen against a backdrop of limited structured training, fragmented information sources, and a shortage of trusted, context-specific educational offerings. Many individuals want to participate in the blockchain and Web3 economy but do not know where to start, while organizations see the potential of blockchain but lack internal expertise.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Blockchain Oracle is created to bridge this gap. It allows individuals and organizations to learn, experiment, and build with blockchain—without having to navigate the complexity of sourcing credible trainers, designing curricula, or coordinating multiple service providers. The platform embodies AlpharKing Enterprise&apos;s commitment to innovation, education, and sustainable digital development.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To become Africa&apos;s leading hub for Blockchain and Web3 mastery, empowering individuals and organizations with the knowledge, skills, and advisory support required to drive inclusive digital transformation and economic growth.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to create a scalable and accessible educational and enterprise platform that:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
              <li>
                Delivers high-quality Blockchain Foundations and Web3 Mastery courses tailored to African contexts.
              </li>
              <li>
                Equips learners with practical skills that translate into employment, entrepreneurship, and innovation.
              </li>
              <li>
                Supports startups, SMEs, and enterprises with consulting services covering staffing, tokenomics, business development, and launch-to-market strategies.
              </li>
              <li>
                Promotes responsible, ethical, and secure participation in crypto and Web3 ecosystems.
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We are committed to combining transparency, trust, and innovation to make blockchain education and adoption attainable for Nigerians and Africans at large.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
