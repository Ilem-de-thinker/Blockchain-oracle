import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Parallax } from "swiper/modules";
import { authApi, mapBackendRoleToFrontend } from "@/src/api/auth";
import { coursesApi, Course } from "@/src/api/courses";
import eventsApi, { Event as ApiEvent } from "@/src/api/events";
import testimonialsApi, { Testimonial } from "@/src/api/testimonials";
import { UserRole, User } from "@/types";
import GoogleSignInModal from "@/components/GoogleSignInModal";
import LogoText from "@/components/LogoText";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/parallax";

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2">
      {[
        { val: timeLeft.days, label: "d" },
        { val: timeLeft.hours, label: "h" },
        { val: timeLeft.minutes, label: "m" },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-purple-600/10 backdrop-blur rounded-lg px-2 py-1 text-center min-w-[40px]"
        >
          <div className="text-sm font-bold text-purple-700">{item.val}</div>
          <div className="text-[8px] text-purple-500 uppercase">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = authApi.isAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = "/";
  };

  const links = [
    { name: "Home", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Courses", href: "#courses" },
    { name: "Events", href: "#events" },
    { name: "Enterprise", href: "#enterprise" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    requestAnimationFrame(() => {
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-500 ${
        scrolled
          ? "bg-white backdrop-blur-xl border-b border-purple-100 shadow-lg shadow-purple-500/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 12 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/Logo/logo.png"
              alt="BlockchainOracle Logo"
              className="w-8 h-8 object-contain"
            />
          </motion.div>
          <span className="text-xl font-black text-gray-900">
            Blo|&lt;Chain
            <span style={{ fontWeight: 300, fontSize: "1.2em" }}>0</span>racle
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {/* <Link to="/legacy" className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all">
            Classic
          </Link> */}
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Sign Out"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-gray-900 text-xl"
        >
          {mobileOpen ? (
            <i className="fas fa-times"></i>
          ) : (
            <i className="fas fa-bars"></i>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-purple-100"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-gray-600 hover:text-purple-600 py-2 font-medium"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                {/* <Link to="/legacy" className="w-full py-2.5 rounded-xl text-sm font-bold text-center border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-300 transition-all">Classic Homepage</Link> */}
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-center border border-gray-200 text-gray-600"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const HeroCarousel: React.FC = () => {
  const slides = [
    {
      headline: "Master Blockchain & Web3 Skills",
      subtext:
        "Learn blockchain, crypto, and Web3 technologies with structured programs built for Africa.",
      image:
        "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2000",
      gradient: "from-purple-100 via-white to-purple-50",
      accent: "from-purple-600 to-purple-400",
    },
    {
      headline: "Build the Future with Web3",
      subtext:
        "Develop decentralized applications, smart contracts, and next-generation blockchain solutions.",
      image:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000",
      gradient: "from-purple-50 via-white to-indigo-50",
      accent: "from-indigo-600 to-purple-500",
    },
    {
      headline: "Blockchain Solutions for Businesses",
      subtext:
        "Enterprise-grade consulting, training, and implementation for organizations ready to innovate.",
      image:
        "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2000",
      gradient: "from-violet-50 via-white to-purple-50",
      accent: "from-violet-600 to-purple-500",
    },
    {
      headline: "Join Africa's Web3 Movement",
      subtext:
        "Connect with thousands of learners, developers, and innovators building the decentralized future.",
      image:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000",
      gradient: "from-purple-100 via-white to-fuchsia-50",
      accent: "from-purple-600 to-fuchsia-500",
    },
  ];

  return (
    <div className="absolute inset-0">
      <Swiper
        modules={[Autoplay, EffectFade, Parallax]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="h-full relative flex items-center overflow-hidden">
              {/* Background Image */}
              <motion.img
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 5, ease: "linear" }}
                src={slide.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlay Gradient for Readability */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-0`}
              />

              <div className="relative z-10 pl-8 md:pl-16 lg:pl-24 max-w-full md:max-w-[45%] lg:max-w-3xl">
                <motion.h1
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-5xl md:text-5xl lg:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-6"
                >
                  {slide.headline}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-lg md:text-xl text-gray-600 max-w-xl font-medium"
                >
                  {slide.subtext}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 mt-8"
                >
                  <Link
                    to="/courses"
                    className="px-8 py-3.5 rounded-xl mr-6 text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all text-center"
                  >
                    Start Learning
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 mr-6 rounded-xl text-sm font-bold border-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all text-center"
                  >
                    Free Account
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <ParticleField />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/30 pointer-events-none" />
    </div>
  );
};

const FloatingCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 60 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 1, delay: 0.8 }}
    className="absolute right-4 md:right-6 lg:right-12 top-1/2 -translate-y-1/2 z-20 hidden md:block"
  >
    <div className="relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-purple-400 rounded-3xl blur-xl opacity-20 animate-pulse" />
      <div className="relative bg-white backdrop-blur-xl border border-purple-200 rounded-3xl p-6 lg:p-8 w-[320px] lg:w-96 shadow-2xl shadow-purple-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
            <img
              src="/Logo/logo.png"
              alt="BlockchainOracle Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h3
              className="font-bold text-gray-900 text-lg"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              Blo|&lt;Chain
              <span
                style={{
                  fontWeight: 300,
                  fontSize: "1.2em",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                0
              </span>
              racle
            </h3>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Deliverying structured education, enterprise services, and advisory
          solutiions for inclusive digital transformation across Africa.
        </p>
        <div className="space-y-3">
          <Link
            to="/enterprise"
            className="w-full py-3 rounded-xl text-sm font-bold border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
          >
            Explore Services
          </Link>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?u=${i + 30}`}
                className="w-7 h-7 rounded-full border-2 border-white"
                alt=""
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 font-bold">
              Active Learners
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const FloatingReadMoreButton: React.FC = () => {
  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToAbout}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 group"
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg group-hover:bg-purple-500/40 transition-all" />
        <div className="relative bg-white backdrop-blur border border-purple-200 rounded-full px-6 py-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:border-purple-300 transition-all">
          <span className="text-sm font-bold">explore</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <i className="fas fa-arrow-down text-xs"></i>
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
};

const HeroSection: React.FC = () => (
  <section
    id="hero"
    className="relative min-h-screen flex items-center overflow-hidden"
  >
    <HeroCarousel />
    <FloatingCard />
    <FloatingReadMoreButton />
  </section>
);

const partners = [
  {
    name: "Binance",
    logo: "/crypto-logos/bnb.svg",
  },
  {
    name: "Ethereum",
    logo: "/crypto-logos/eth.svg",
  },
  {
    name: "Polygon",
    logo: "/crypto-logos/polygon.svg",
  },
  { name: "Solana", logo: "/crypto-logos/solana.svg" },
  {
    name: "Chainlink",
    logo: "/crypto-logos/chainlink.svg",
  },
  {
    name: "Cardano",
    logo: "/crypto-logos/cardano.svg",
  },
  {
    name: "Polkadot",
    logo: "/crypto-logos/polkadot.svg",
  },
  {
    name: "Avalanche",
    logo: "/crypto-logos/avalanche.svg",
  },
];

const TrustedBy: React.FC = () => {
  return (
    <section className="py-16 border-y border-gray-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={48}
          slidesPerView="auto"
          loop
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={3000}
          className="!overflow-visible"
        >
          {[...partners, ...partners].map((p, i) => (
            <SwiperSlide key={i} className="!w-auto">
              <div className="flex items-center gap-3 h-12 px-6">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="h-8 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const AboutPreview: React.FC = () => (
  <section id="about" className="py-32 bg-white relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50/50 rounded-full blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-200/40 to-purple-100/40 rounded-3xl blur-xl" />
          <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&h=400&fit=crop"
              alt="Blockchain"
              className="w-full h-90 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <i className="fas fa-play text-purple-600 text-sm"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-6">
          About Us
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
          Blockchain & Web3{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
            Mastery
          </span>{" "}
          for Africa
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          Blockchain Oracle is a leading Blockchain and Web3 education and
          enterprise solutions platform dedicated to empowering Africa's digital
          future. We provide a comprehensive learning ecosystem where
          individuals can gain practical knowledge through structured programs
          in Blockchain Foundations, Web3 Mastery, and Crypto Trading, while
          organizations access strategic consulting, training, events, and
          advisory services to accelerate blockchain adoption.{" "}
        </p>
        <div className="space-y-4 mb-8">
          {[
            "Structured Blockchain Foundations and Web3 Mastery courses",
            "Combining education with real-world practice through events and consulting",
            "Supporting enterprises with end-to-end advisory, and launch strategies",
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-3"
            >
              <i className="fas fa-check-circle text-purple-600 mt-1 shrink-0"></i>
              <span className="text-gray-600 text-sm font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          Explore Courses <i className="fas fa-arrow-right text-xs"></i>
        </Link>
      </motion.div>
    </div>
  </section>
);

const PlatformFeatures: React.FC = () => {
  const features = [
    {
      icon: "fas fa-graduation-cap",
      title: "Structured Learning",
      desc: "Begin your blockchain journey with clear curriculum pathways from foundational blockchain concepts to intermediate Web3 mastery.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: "fas fa-code",
      title: "Real-World Practice",
      desc: "Engage in Events, webinars, and consulting services that bridge theory to implementation.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: "fas fa-chart-line",
      title: "Progress Tracking",
      desc: "Monitor your Journey with module completion tracking, visual progress indicators, and estimated learning timeline",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Certified Programs",
      desc: "Showcase your achievements with downloadable certificates backed by unique verification codes upon successful course completion.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: "fas fa-users",
      title: "Community Hub",
      desc: "Industry-relevant courses and case studies aligned with African economic system and technological environment.",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: "fas fa-globe",
      title: "African-Focused Content",
      desc: "Curricula and case studies tailored to African markets, regulations, and infrastructure realities.",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <section className="py-32 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Powerful{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Platform
            </span>{" "}
            Features
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Structured blockchain education and enterprise services designed for
            African learners and organizations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white border border-gray-100 rounded-2xl p-8 hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform`}
              >
                <i className={f.icon}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CoursesPreview: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await coursesApi.getCourses(
          1,
          4,
          undefined,
          undefined,
          undefined,
          "-created_at",
          undefined,
          true,
        );
        setFeaturedCourses(response.items || []);
      } catch (err) {
        console.error("Failed to fetch featured courses:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section id="courses" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
        >
          <div>
            <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
              Courses
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Featured{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                Courses
              </span>
            </h2>
          </div>
          <Link
            to="/courses"
            className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-2 text-sm group"
          >
            View All Courses{" "}
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </motion.div>

        {coursesLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="animate-pulse bg-white border border-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex justify-between pt-2">
                    <div className="h-5 bg-gray-100 rounded w-16" />
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.slice(0, 4).map((c, i) => (
              <Link key={c.id} to={`/courses/${c.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-all hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    {c.thumbnail_url ? (
                      <img
                        src={c.thumbnail_url}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                        <span className="text-white/20 text-6xl font-black">
                          {c.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
                    {c.level && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                        {c.level}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-gray-900">
                        {parseFloat(c.total_amount || "0") === 0
                          ? "FREE"
                          : `₦${c.total_amount}`}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all flex items-center justify-center">
                        <i className="fas fa-arrow-right text-xs"></i>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const LearningPaths: React.FC = () => {
  const paths = [
    {
      title: "Blockchain Foundations",
      steps: [
        "Blockchain Basics",
        "Cryptography",
        "Consensus Mechanisms",
        "Network Architecture",
        "Use Cases",
      ],
      icon: "fas fa-cube",
      color: "from-purple-500 to-blue-500",
    },
    {
      title: "Web3 Developer / Builder",
      steps: [
        "Web3 Basics",
        "Smart Contracts",
        "DApp Development",
        "DeFi Protocols",
        "Security",
      ],
      icon: "fas fa-code",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Crypto Literacy & Trading",
      steps: [
        "Market Basics",
        "Risk Management",
        "Technical Analysis",
        "Fundamental Analysis",
        "Security Practices",
      ],
      icon: "fas fa-chart-line",
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Learning Paths
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Path
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {paths.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group bg-white border border-gray-100 rounded-2xl p-8 hover:border-purple-200 transition-all hover:shadow-lg"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xl mb-6`}
              >
                <i className={p.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {p.title}
              </h3>
              <div className="space-y-3">
                {p.steps.map((step, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {j + 1}
                    </div>
                    <span className="text-gray-600 text-sm font-medium">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EnterpriseServices: React.FC = () => {
  const services = [
    {
      title: "Staffing & Recruitment",
      desc: "Blockchain talent sourcing and recruitment for technical and advisory roles",
      icon: "fas fa-users",
    },
    {
      title: "Tokenomics Design",
      desc: "Economic modeling and tokenomics creation for blockchain-based business models",
      icon: "fas fa-chart-line",
    },
    {
      title: "Business Development",
      desc: "Partnership strategy and business development support for blockchain adoption",
      icon: "fas fa-shield-alt",
    },
    {
      title: "Launch-to-Market Strategy",
      desc: "Go-to-market strategy and launch planning for blockchain products and platforms",
      icon: "fas fa-rocket",
    },
    {
      title: "Enterprise Platform Development",
      desc: "Custom enterprise platforms with dedicated user dashboards, course management systems, role-based access control, and comprehensive admin panels tailored to your organization.",
      icon: "fas fa-laptop-code",
    },
  ];

  return (
    <section
      id="enterprise"
      className="py-32 bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-purple-50/50" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Enterprise
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Enterprise{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Services
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4">
            From web3 webiners and blockchain events to coperate training and
            consulting, we support african enterprices in adopting emerging
            technologies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`group bg-white border border-gray-100 rounded-2xl p-8 hover:border-purple-200 transition-all flex items-start gap-5 hover:shadow-lg ${i === services.length - 1 ? "md:col-span-2 md:max-w-xl md:mx-auto md:w-full" : ""}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <i className={s.icon}></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EventsWebinars: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<ApiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getEvents(1, 3);
        setFeaturedEvents(response.results || []);
      } catch (err) {
        console.error("Failed to fetch featured events:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section id="events" className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
        >
          <div>
            <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
              Events
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Upcoming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                Events
              </span>
            </h2>
          </div>
          <Link
            to="/events"
            className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-2 text-sm group"
          >
            View All Events{" "}
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </motion.div>

        {eventsLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="animate-pulse bg-white border border-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map((e, i) => (
              <Link key={e.id} to={`/events/${e.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-all hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    {e.image_url ? (
                      <img
                        src={e.image_url}
                        alt={e.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                        <i className="fas fa-calendar-alt text-white/20 text-6xl"></i>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                      {e.type}
                    </span>
                    {parseFloat(e.registration_fee || "0") +
                      parseFloat(e.event_fee || "0") ===
                      0 && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-purple-500/90 text-white text-[10px] font-bold uppercase tracking-wider">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {e.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {e.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-400">
                        {new Date(e.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <CountdownTimer targetDate={e.date} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <i className="fas fa-users text-[10px]"></i>
                        {e.registrations_count} attending
                      </span>
                      <div className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        Register
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const TestimonialCard: React.FC<{
  testimonial: Testimonial;
}> = ({ testimonial }) => {
  const name = testimonial.user?.full_name || testimonial.name || "Anonymous";
  const role = testimonial.user?.role || testimonial.role || "";
  const image =
    testimonial.user?.profile_picture ||
    testimonial.image ||
    `https://i.pravatar.cc/100?u=${name}`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-purple-100/50 border border-gray-100 hover:border-purple-200 transition-all flex-shrink-0 mx-2 my-3">
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <img
          src={image}
          alt={name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
};

const ScrollingCarousel: React.FC<{
  testimonials: Testimonial[];
  direction: "up" | "down";
  speed: number;
}> = ({ testimonials, direction, speed }) => {
  const duplicated = [...testimonials, ...testimonials];

  return (
    <div className="overflow-hidden h-[500px] relative">
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .scroll-up {
          animation: scrollUp ${speed}s linear infinite;
        }
        .scroll-down {
          animation: scrollDown ${speed}s linear infinite;
        }
        .carousel-container:hover .scroll-up,
        .carousel-container:hover .scroll-down {
          animation-play-state: paused;
        }
      `}</style>
      <div
        className={`carousel-container absolute w-full ${direction === "up" ? "scroll-up" : "scroll-down"}`}
      >
        {duplicated.map((testimonial, idx) => (
          <div key={idx}>
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialsApi.getPublicTestimonials();
        setTestimonials(data);
      } catch {
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const useCarousel = testimonials.length > 5;

  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
        Testimonials
      </span>
      <h2 className="text-4xl md:text-5xl font-black text-gray-900">
        What Our{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
          Students
        </span>{" "}
        Say
      </h2>
    </motion.div>
  );

  if (loading) {
    return (
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {renderHeader()}
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {renderHeader()}
          <p className="text-center text-gray-500 text-sm">
            No testimonials yet. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  if (!useCarousel) {
    return (
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {renderHeader()}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const chunkSize = Math.ceil(testimonials.length / 3);
  const col1 = testimonials.slice(0, chunkSize);
  const col2 = testimonials.slice(chunkSize, chunkSize * 2);
  const col3 = testimonials.slice(chunkSize * 2);

  return (
    <section id="testimonials" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {renderHeader()}
        <div className="lg:grid lg:grid-cols-3 gap-8 hidden">
          <ScrollingCarousel testimonials={col1} direction="up" speed={25} />
          <ScrollingCarousel testimonials={col2} direction="down" speed={25} />
          <ScrollingCarousel testimonials={col3} direction="up" speed={25} />
        </div>
        <div className="lg:hidden">
          <ScrollingCarousel testimonials={testimonials} direction="up" speed={40} />
        </div>
      </div>
    </section>
  );
};

const BlogPreview: React.FC = () => {
  const posts = [
    {
      title: "Understanding Layer 2 Scaling Solutions",
      category: "Technology",
      date: "Mar 28, 2026",
      image:
        "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=250&fit=crop",
    },
    {
      title: "The Future of DeFi in Emerging Markets",
      category: "Finance",
      date: "Mar 25, 2026",
      image:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=250&fit=crop",
    },
    {
      title: "NFTs Beyond Art: Real-World Applications",
      category: "Innovation",
      date: "Mar 22, 2026",
      image:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=250&fit=crop",
    },
  ];

  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Blog
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Latest{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Insights
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-all hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
              </div>
              <div className="p-5">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  {p.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-2 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-xs text-gray-400">{p.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700" />
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.09] rounded-full blur-3xl animate-pulse" />
    </div>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto px-6 text-center relative z-10"
    >
      <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
        Ready to Build the <span className="text-white/80">Future?</span>
      </h2>
      <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
        Start your journey into blockchain and Web3 mastery with structured,
        accessible education designed for Africa.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/courses"
          className="px-10 py-4 rounded-2xl text-sm font-bold bg-white text-purple-700 hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
        >
          Start Learning Today
        </Link>
        <Link
          to="/register"
          className="px-10 py-4 rounded-2xl text-sm font-bold border-2 border-white/40 text-white hover:bg-white/10 transition-all"
        >
          Create Free Account
        </Link>
      </div>
    </motion.div>
  </section>
);

const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-400 z-[200] origin-left"
      style={{ scaleX }}
    />
  );
};

const LandingPageV2: React.FC<{ onLogin?: (user: User) => void }> = ({
  onLogin,
}) => {
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      const dismissed = localStorage.getItem("signin_dismissed_at");
      if (dismissed) {
        const elapsed = Date.now() - parseInt(dismissed, 10);
        if (elapsed < 24 * 60 * 60 * 1000) return;
      }
      const timer = setTimeout(() => {
        setShowSignInModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = (user: User) => {
    if (onLogin) onLogin(user);
    setShowSignInModal(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("signin_dismissed_at", Date.now().toString());
    setShowSignInModal(false);
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <HeroSection />
      <TrustedBy />
      <AboutPreview />
      <PlatformFeatures />
      <CoursesPreview />
      <LearningPaths />
      <EnterpriseServices />
      <EventsWebinars />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
      <GoogleSignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onLogin={handleLogin}
        onDismiss={handleDismiss}
      />
    </div>
  );
};

export default LandingPageV2;
