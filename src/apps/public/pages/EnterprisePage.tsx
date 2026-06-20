import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCheck,
  Coins,
  Briefcase,
  Rocket,
  Laptop,
  ArrowRight,
  ChevronRight,
  Building2,
} from "lucide-react";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay },
});

const services = [
  {
    image: "/images/enterprise/staffing.jpg",
    icon: UserCheck,
    title: "Staffing & Recruitment",
    desc: "Blockchain talent sourcing and recruitment for technical and advisory roles across the African technology ecosystem.",
    highlight: "Talent sourcing, technical recruitment, advisory roles",
  },
  {
    image: "/images/enterprise/tokenomics.jpg",
    icon: Coins,
    title: "Tokenomics Design",
    desc: "Economic modeling and tokenomics creation for blockchain-based business models, ensuring sustainable incentive structures and long-term value alignment.",
    highlight: "Economic modeling, incentive design, value alignment",
  },
  {
    image: "/images/enterprise/business-dev.jpg",
    icon: Briefcase,
    title: "Business Development",
    desc: "Partnership strategy and business development support for organizations adopting and integrating blockchain technology.",
    highlight: "Partnership strategy, market entry, BD support",
  },
  {
    image: "/images/enterprise/launch-strategy.jpg",
    icon: Rocket,
    title: "Launch-to-Market Strategy",
    desc: "Go-to-market strategy and launch planning for blockchain products and platforms targeting African and global markets.",
    highlight: "GTM strategy, product launch, market planning",
  },
  {
    image: "/images/enterprise/platform-dev.jpg",
    icon: Laptop,
    title: "Enterprise Platform Development",
    desc: "Custom enterprise platforms with dedicated user dashboards, course management systems, role-based access control, and comprehensive admin panels tailored to your organization.",
    highlight: "Custom platforms, dashboards, RBAC, admin panels",
  },
];

const EnterprisePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="/images/enterprise/hero.jpg"
          alt="Enterprise Services"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-purple-900/20" />
        <motion.div
          {...fadeUp(0)}
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-bold tracking-widest uppercase mb-6 ring-1 ring-white/20">
            Enterprise
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Enterprise{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-100">
              Services
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            From web3 webinars and blockchain events to corporate training and
            consulting, we support African enterprises in adopting emerging
            technologies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/25"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm hover:bg-white/20 transition-all ring-1 ring-white/25"
            >
              Explore Courses
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 bg-[#FAF8FF] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <motion.div {...fadeUp(0.1)} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
              What We Offer
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Enterprise{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                Solutions
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              End-to-end blockchain services tailored for African enterprises
              ready to innovate and scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.05)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-purple-200/50 hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white ring-1 ring-white/25 group-hover:bg-purple-600 group-hover:ring-0 transition-all duration-300">
                      <s.icon size={22} />
                    </div>
                  </div>
                  <div className="absolute top-5 right-5">
                    <span className="text-xs font-bold text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {s.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.highlight.split(", ").map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <motion.div
          {...fadeUp(0.1)}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          <Building2
            size={48}
            className="mx-auto mb-6 text-purple-200/60"
          />
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-purple-200/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            Partner with us to build, launch, and scale your blockchain
            initiatives with expert guidance and enterprise-grade solutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-purple-800 font-bold text-sm hover:bg-purple-50 transition-all shadow-lg"
            >
              Contact Us Today
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm hover:bg-white/20 transition-all ring-1 ring-white/25"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default EnterprisePage;
