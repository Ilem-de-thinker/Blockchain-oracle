import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Menu,
  X,
  Star,
  Play,
  Check,
  ArrowRight,
  GraduationCap,
  Code2,
  ChartLine,
  ShieldCheck,
  Users,
  Globe,
  Calendar,
  MapPin,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Layers,
  Terminal,
  LineChart,
  TrendingUp,
  UserCheck,
  Rocket,
  Laptop,
  Briefcase,
  Building2,
  Network,
  Coins,
  Lightbulb,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Parallax } from "swiper/modules";
import { authApi, mapBackendRoleToFrontend } from "@/src/api/auth";
import { coursesApi, Course } from "@/src/api/courses";
import eventsApi from "@/src/api/events";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/parallax";

import testimonialsApi, { Testimonial } from "@/src/api/testimonials";
import { UserRole, User } from "@/types";
import GoogleSignInModal from "@/components/GoogleSignInModal";
import TelegramJoinBanner from "@/components/TelegramJoinBanner";
import LogoText from "@/components/LogoText";

const HexPatternBg: React.FC = () => (
  <div
    className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10"
    aria-hidden
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='69.28' height='80' viewBox='0 0 69.28 80'%3E%3Cpath d='M34.64 0 L69.28 20 L69.28 60 L34.64 80 L0 60 L0 20 Z' fill='none' stroke='%237C3AED' stroke-width='2.5'/%3E%3Cpath d='M34.64 80 L69.28 100 L69.28 140 L34.64 160 L0 140 L0 100 Z' fill='none' stroke='%237C3AED' stroke-width='2.5'/%3E%3Cpath d='M0 20 L34.64 40 L34.64 80 L0 100 Z' fill='none' stroke='%237C3AED' stroke-width='1.5'/%3E%3Cpath d='M69.28 20 L34.64 40 L34.64 0 Z' fill='none' stroke='%237C3AED' stroke-width='1.5'/%3E%3Cpath d='M69.28 60 L34.64 40 L34.64 80 Z' fill='none' stroke='%237C3AED' stroke-width='1.5'/%3E%3C/svg%3E")`,
      backgroundSize: "69.28px 80px",
      animation: "bgDriftUp 40s linear infinite",
    }}
  >
    <style>{`
      @keyframes bgDriftUp {
        0% { background-position: 0 0; }
        100% { background-position: 0 -80px; }
      }
    `}</style>
  </div>
);

const testimonialsData = [
  {
    name: "Ita Otu",
    role: "Blockchain Architect",
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2000",
    quote:
      "The community features make learning social and engaging. I've made great connections with fellow learners",
  },
  {
    name: "Effiom Bassey",
    role: "Blockchain Developer",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000",
    quote:
      "AlphaKing Oracle transformed my learning experience. The AI-powered guidance helped me choose the perfect course path",
  },
  {
    name: "Uyai Ekpo",
    role: "DeFi Analyst",
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2000",
    quote:
      "The personalized learning paths really helped me stay focused and motivated throughout my courses ",
  },
  {
    name: "Idara Edet",
    role: "Smart Contract Engineer",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000",
    quote:
      "The project-based learning approach is fantastic. I've gained practical skills that I'm already using in my career",
  },
  {
    name: "Ekaette Eyo",
    role: "Crypto Analyst",
    image:
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2000",
    quote:
      "The AI mentor provided valuable feedback that helped me improve my coding skills significantly",
  },
  {
    name: "Okon Ubi",
    role: "Web3 Developer",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000",
    quote:
      "Great platform for self-paced learning. The interactive exercises really help reinforce the concepts",
  },
];

const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
};

const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const ProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-purple-600 w-full z-[100] origin-left"
      style={{ scaleX }}
    />
  );
};

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const user = authApi.getStoredUser();
  const isAuthenticated = authApi.isAuthenticated();

  const dashboardPath = (() => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case UserRole.SUPER_ADMIN: return "/super-admin";
      case UserRole.ADMIN: return "/admin";
      case UserRole.INSTRUCTOR: return "/tutor";
      case UserRole.INFLUENCER: return "/influencer";
      case UserRole.CONTRIBUTOR: return "/contributor";
      default: return "/dashboard";
    }
  })();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Courses", href: "#courses" },
    { name: "Events", href: "#events" },
    { name: "Enterprise", href: "/enterprise" },
  ];

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    requestAnimationFrame(() => {
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 h-20 px-6 lg:px-10 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100/30"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-8">
        <LogoText />
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.name}
              onClick={() => handleNavClick(l.href)}
              className="text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors border-b-2 border-transparent hover:border-purple-600 pb-0.5"
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to={dashboardPath}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 transition-all"
            >
              Dashboard
            </Link>
            <Link
              to={`${dashboardPath}/profile`}
              className="flex items-center gap-2 group"
            >
              <img
                src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.email}`}
                alt={user?.name}
                className="w-9 h-9 rounded-full border-2 border-purple-600"
              />
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 border-2 border-purple-600 text-purple-600 text-sm font-bold rounded-full hover:bg-purple-50 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </button>
          </>
        )}
      </div>

      <button
        className="md:hidden p-2 text-gray-700"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-purple-100 shadow-lg p-6 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <button
                key={l.name}
                onClick={() => handleNavClick(l.href)}
                className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors text-left"
              >
                {l.name}
              </button>
            ))}
            <hr className="border-purple-100" />
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => { setMobileOpen(false); await authApi.logout(); window.location.href = "/login"; }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/login"); }}
                  className="px-5 py-2.5 border-2 border-purple-600 text-purple-600 text-sm font-bold rounded-full text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/register"); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-bold rounded-full text-center"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
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
              <motion.img
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 5, ease: "linear" }}
                src={slide.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
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
  "Binance", "Ethereum", "Polygon", "Cardano",
  "Solana", "Coinbase", "Chainlink",
];

const TrustedBy: React.FC = () => (
  <section className="py-12 border-y border-purple-100/30 bg-white overflow-hidden">
    <div className="overflow-hidden whitespace-nowrap flex relative">
      <div className="flex items-center gap-20 px-10 animate-scroll">
        {[...partners, ...partners].map((name, i) => (
          <span
            key={i}
            className="text-gray-400 font-bold text-2xl grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-pointer"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const AboutPreview: React.FC = () => (
  <section id="about" className="py-20 lg:py-24 relative overflow-hidden">
    <HexPatternBg />
    <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
      <Reveal>
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/40 to-purple-100/40 rounded-3xl blur-xl" />
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&h=400&fit=crop"
              alt="Blockchain"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-purple-600/20 group-hover:bg-purple-600/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                <Play
                  size={36}
                  className="text-purple-600 ml-1"
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
          ABOUT US
        </span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Blockchain & Web3{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
            Mastery
          </span>{" "}
          for Africa
        </h2>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          Blockchain Oracle is a leading Blockchain and Web3 education and
          enterprise solutions platform dedicated to empowering Africa's digital
          future.
        </p>
        <div className="space-y-4 mb-8">
          {[
            "Structured Blockchain Foundations and Web3 Mastery courses",
            "Combining education with real-world practice through events and consulting",
            "Supporting enterprises with end-to-end advisory, and launch strategies",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={14} className="text-green-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          Explore Courses <ArrowRight size={14} />
        </Link>
      </Reveal>
    </div>
    </div>
  </section>
);

const PlatformFeatures: React.FC = () => {
  const features = [
    {
      image: "/images/features/learning.jpg",
      icon: BookOpen,
      title: "Structured Learning",
      desc: "Begin your blockchain journey with clear curriculum pathways from foundational blockchain concepts to intermediate Web3 mastery.",
    },
    {
      image: "/images/features/practice.jpg",
      icon: Terminal,
      title: "Real-World Practice",
      desc: "Engage in Events, webinars, and consulting services that bridge theory to implementation.",
    },
    {
      image: "/images/features/progress.jpg",
      icon: LineChart,
      title: "Progress Tracking",
      desc: "Monitor your Journey with module completion tracking, visual progress indicators, and estimated learning timeline",
    },
    {
      image: "/images/features/certified.jpg",
      icon: ShieldCheck,
      title: "Certified Programs",
      desc: "Showcase your achievements with downloadable certificates backed by unique verification codes upon successful course completion.",
    },
    {
      image: "/images/features/community.jpg",
      icon: Users,
      title: "Community Hub",
      desc: "Industry-relevant courses and case studies aligned with African economic system and technological environment.",
    },
    {
      image: "/images/features/africa.jpg",
      icon: Globe,
      title: "African-Focused Content",
      desc: "Curricula and case studies tailored to African markets, regulations, and infrastructure realities.",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Powerful{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Platform
            </span>{" "}
            Features
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Structured blockchain education and enterprise services designed for
            African learners and organizations.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className="group relative overflow-hidden rounded-2xl cursor-pointer h-full min-h-[280px]"
              >
                <img
                  src={f.image}
                  alt={f.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/10" />
                <div className="relative h-full flex flex-col justify-end p-6 lg:p-8">
                  <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white ring-1 ring-white/20">
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                    {f.desc}
                  </p>
                </div>
              </div>
            </Reveal>
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
      } catch {
        // silently fail
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section id="courses" className="py-20 lg:py-24 relative overflow-hidden">
      <HexPatternBg />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
      <Reveal className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
          Courses
        </span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          Featured{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
            Courses
          </span>
        </h2>
        <Link
          to="/courses"
          className="inline-flex text-purple-600 hover:text-purple-700 font-bold items-center gap-2 text-sm group"
        >
          View All Courses{" "}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </Reveal>

      {coursesLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="animate-pulse bg-white border border-purple-100 rounded-2xl overflow-hidden"
            >
              <div className="h-44 bg-purple-50" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-purple-50 rounded w-3/4" />
                <div className="h-3 bg-purple-50 rounded w-1/2" />
                <div className="flex justify-between pt-2">
                  <div className="h-5 bg-purple-50 rounded w-16" />
                  <div className="w-10 h-10 bg-purple-50 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.slice(0, 4).map((c, i) => (
            <Link key={c.id} to={`/courses/${c.id}`}>
              <Reveal delay={i * 0.08}>
                <div className="group bg-white rounded-2xl overflow-hidden border border-purple-100/50 shadow-sm hover:shadow-xl transition-all">
                  <div className="relative h-44 overflow-hidden">
                    {c.thumbnail_url ? (
                      <img
                        src={c.thumbnail_url}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
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
                  <div className="p-6">
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
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
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
      icon: Layers,
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
      icon: Code2,
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
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            LEARNING PATHS
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Path
            </span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {paths.map((p, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="group bg-white border border-purple-100/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:border-purple-200/50">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <p.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {p.title}
                </h3>
                <div className="space-y-4">
                  {p.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-4">
                      <span className="text-sm font-mono text-gray-300 font-semibold w-6 shrink-0 mt-0.5">
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span className="text-gray-600 text-sm font-medium leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const EventsPreview: React.FC = () => {
  const [events, setEvents] = useState<import("@/src/api/events").Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [upcoming, past] = await Promise.all([
          eventsApi.getUpcomingEvents(1, 5),
          eventsApi.getPastEvents(1, 5),
        ]);
        const all = [...(upcoming.results || []), ...(past.results || [])];
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(all);
      } catch {
        // silently fail
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEventTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "webinar": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "workshop": return "bg-purple-600/20 text-purple-600 border-purple-600/30";
      case "conference": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "meetup": return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
      case "bootcamp": return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "seminar": return "bg-rose-500/20 text-rose-600 border-rose-500/30";
      case "hackathon": return "bg-cyan-500/20 text-cyan-600 border-cyan-500/30";
      case "panel": return "bg-pink-500/20 text-pink-600 border-pink-500/30";
      case "networking": return "bg-indigo-500/20 text-indigo-600 border-indigo-500/30";
      default: return "bg-teal-500/20 text-teal-600 border-teal-500/30";
    }
  };

  return (
    <section id="events" className="py-20 lg:py-24 bg-[#FAF8FF] relative overflow-hidden">
      <HexPatternBg />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Events
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Upcoming{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Events
            </span>
          </h2>
          <Link
            to="/dashboard/events"
            className="inline-flex text-purple-600 hover:text-purple-700 font-bold items-center gap-2 text-sm group"
          >
            View All Events{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </Reveal>

        {eventsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="animate-pulse bg-white border border-purple-100 rounded-2xl overflow-hidden"
              >
                <div className="h-44 bg-purple-50" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-purple-50 rounded w-3/4" />
                  <div className="h-3 bg-purple-50 rounded w-1/2" />
                  <div className="h-5 bg-purple-50 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Reveal>
            <div className="border-2 border-dashed border-purple-200 rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                <Calendar size={36} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Exciting updates dropping soon
              </h3>
              <p className="text-gray-500 max-w-md">
                We're finalizing our Q4 roadshow across Lagos, Nairobi, and
                Johannesburg. Stay tuned!
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.slice(0, 4).map((event, i) => (
              <Reveal key={event.id} delay={i * 0.08}>
                <div className="group bg-white rounded-2xl overflow-hidden border border-purple-100/50 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                        <Calendar className="text-white/20" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getEventTypeColor(event.type)}`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1 mb-4 flex-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatEventDate(event.date)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        {event.is_online ? (
                          <Globe size={12} />
                        ) : (
                          <MapPin size={12} />
                        )}
                        {event.is_online ? "Online" : event.location || "TBD"}
                      </p>
                    </div>
                    <Link
                      to={`/dashboard/events/${event.id}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                    >
                      <ExternalLink size={12} />
                      View Details
                    </Link>
                  </div>
                </div>
              </Reveal>
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
          <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
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
        const hardcoded = testimonialsData.map((t, i) => ({
          id: -(i + 1),
          name: t.name,
          role: t.role,
          image: t.image,
          quote: t.quote,
          is_public: true,
          status: "approved" as const,
          order: i,
          created_at: "",
          updated_at: "",
        }));
        const seen = new Set<string>();
        const merged = [...hardcoded, ...data].filter((t) => {
          const key = `${t.name || t.user?.full_name}|${t.quote}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setTestimonials(merged);
      } catch {
        setTestimonials(
          testimonialsData.map((t, i) => ({
            id: -(i + 1),
            name: t.name,
            role: t.role,
            image: t.image,
            quote: t.quote,
            is_public: true,
            status: "approved" as const,
            order: i,
            created_at: "",
            updated_at: "",
          }))
        );
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
        "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=600&h=338&fit=crop",
    },
    {
      title: "The Future of DeFi in Emerging Markets",
      category: "Finance",
      date: "Mar 25, 2026",
      image:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=600&h=338&fit=crop",
    },
    {
      title: "NFTs Beyond Art: Real-World Applications",
      category: "Innovation",
      date: "Mar 22, 2026",
      image:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&h=338&fit=crop",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-[#FAF8FF] relative overflow-hidden">
      <HexPatternBg />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-widest uppercase mb-4">
            Blog
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
            Latest{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              Insights
            </span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group bg-white border border-purple-100/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block text-xs font-bold text-purple-600 uppercase tracking-wider mb-2.5">
                    {p.category}
                  </span>
                  <h3 className="font-bold text-gray-900 leading-snug group-hover:text-purple-600 transition-colors line-clamp-2 mb-3">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-400">{p.date}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
      <Reveal>
        <div className="bg-purple-600 relative rounded-3xl p-12 lg:p-16 overflow-hidden text-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of African pioneers already building the
              decentralized economy. No prior experience required.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => navigate("/register")}
                className="px-10 py-5 bg-white text-purple-600 text-sm font-bold rounded-full hover:scale-105 transition-all shadow-xl"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="px-10 py-5 bg-transparent border-2 border-white text-white text-sm font-bold rounded-full hover:bg-white/10 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
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
        // Track immediately when shown to guarantee 24 hour appearance limit
        localStorage.setItem("signin_dismissed_at", Date.now().toString());
      }, 5000);
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleDismiss();
    } else {
      setShowSignInModal(open);
    }
  };

  return (
    <div className="bg-[#FAF8FF] min-h-screen overflow-x-hidden">
      <ProgressBar />
      <Navbar />
      <HeroSection />
      <TrustedBy />
      <AboutPreview />
      <PlatformFeatures />
      <CoursesPreview />
      <LearningPaths />
      <EventsPreview />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
      <GoogleSignInModal
        open={showSignInModal}
        onOpenChange={handleOpenChange}
        onLogin={handleLogin}
        onDismiss={handleDismiss}
      />
      <TelegramJoinBanner />
    </div>
  );
};

export default LandingPageV2;
