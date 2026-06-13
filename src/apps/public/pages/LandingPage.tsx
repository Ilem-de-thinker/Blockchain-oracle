import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_COURSES } from '@/constants';
import { authApi, mapBackendRoleToFrontend } from '@/src/api/auth';
import { useToast } from '@/src/hooks/useToast';
import { getErrorMessage } from '@/src/api/errorHandler';
import { User, UserRole } from '@/types';

const GOOGLE_CLIENT_ID = '197664427535-vhc6mus6m7hs3pkklffb61ovvq2f7ltq.apps.googleusercontent.com';

const testimonialsData = [
  {
    name: 'Effiom Bassey',
    role: 'Blockchain Developer',
    image: 'https://i.pravatar.cc/100?u=10',
    quote: 'AlphaKing Oracle transformed my learning experience. The AI-powered guidance helped me choose the perfect course path.'
  },
  {
    name: 'Idara Edet',
    role: 'Smart Contract Engineer',
    image: 'https://i.pravatar.cc/100?u=11',
    quote: 'The project-based learning approach is fantastic. I\'ve gained practical skills that I\'m already using in my career.'
  },
  {
    name: 'Uyai Ekpo',
    role: 'DeFi Analyst',
    image: 'https://i.pravatar.cc/100?u=12',
    quote: 'The personalized learning paths really helped me stay focused and motivated throughout my courses.'
  },
  {
    name: 'Okon Ubi',
    role: 'Web3 Developer',
    image: 'https://i.pravatar.cc/100?u=13',
    quote: 'Great platform for self-paced learning. The interactive exercises really help reinforce the concepts.'
  },
  {
    name: 'Ekaette Eyo',
    role: 'Crypto Analyst',
    image: 'https://i.pravatar.cc/100?u=14',
    quote: 'The AI mentor provided valuable feedback that helped me improve my coding skills significantly.'
  },
  {
    name: 'Ita Otu',
    role: 'Blockchain Architect',
    image: 'https://i.pravatar.cc/100?u=15',
    quote: 'The community features make learning social and engaging. I\'ve made great connections with fellow learners.'
  },
  {
    name: 'Ekong Archibong',
    role: 'DeFi Developer',
    image: 'https://i.pravatar.cc/100?u=16',
    quote: 'The quality of content is exceptional. Every course is well-structured and professionally produced.'
  },
  {
    name: 'Bassey Essien',
    role: 'Smart Contract Auditor',
    image: 'https://i.pravatar.cc/100?u=17',
    quote: 'The hands-on projects really set AlphaKing apart. They\'ve helped me build an impressive portfolio.'
  }
];

const testimonialsData2 = [
  {
    name: 'Ndifreke Effiom',
    role: 'Web3 Entrepreneur',
    image: 'https://i.pravatar.cc/100?u=18',
    quote: 'The AI-powered course recommendations were spot-on. Found exactly what I needed to advance my career.'
  },
  {
    name: 'Abasiama Okon',
    role: 'Blockchain Consultant',
    image: 'https://i.pravatar.cc/100?u=19',
    quote: 'The platform\'s flexibility allowed me to learn at my own pace while working full-time.'
  },
  {
    name: 'Nsikak Inyang',
    role: 'DeFi Strategist',
    image: 'https://i.pravatar.cc/100?u=20',
    quote: 'The instant feedback system helped me identify and correct my mistakes quickly.'
  },
  {
    name: 'Edidiong Ita',
    role: 'Crypto Developer',
    image: 'https://i.pravatar.cc/100?u=21',
    quote: 'The variety of courses is impressive. I\'ve learned multiple skills all on one platform.'
  },
  {
    name: 'Aniebiet Etim',
    role: 'Web3 Engineer',
    image: 'https://i.pravatar.cc/100?u=22',
    quote: 'The mobile app makes it easy to continue learning during my commute. Great for busy professionals!'
  },
  {
    name: 'Imoh Nsa',
    role: 'Blockchain Analyst',
    image: 'https://i.pravatar.cc/100?u=23',
    quote: 'The certification programs are well-recognized in the industry. Helped me land my dream job!'
  },
  {
    name: 'Ekemini Asuquo',
    role: 'DeFi Specialist',
    image: 'https://i.pravatar.cc/100?u=24',
    quote: 'The peer review system provides valuable feedback and different perspectives on my work.'
  },
  {
    name: 'Iquo Ekanem',
    role: 'Smart Contract Dev',
    image: 'https://i.pravatar.cc/100?u=25',
    quote: 'The practice exercises are challenging and really help cement the learning material.'
  }
];

const testimonialsData3 = [
  {
    name: 'Ubong Boco',
    role: 'Blockchain Educator',
    image: 'https://i.pravatar.cc/100?u=26',
    quote: 'The AI tutor\'s 24/7 availability means I can get help whenever I need it.'
  },
  {
    name: 'Ekpe Inyang',
    role: 'Web3 Consultant',
    image: 'https://i.pravatar.cc/100?u=27',
    quote: 'The real-world case studies helped me understand practical applications of theoretical concepts.'
  },
  {
    name: 'Esen Udo',
    role: 'Crypto Trader',
    image: 'https://i.pravatar.cc/100?u=28',
    quote: 'The progress tracking features keep me motivated and help me stay on schedule.'
  },
  {
    name: 'Mfoniso Orok',
    role: 'DeFi Developer',
    image: 'https://i.pravatar.cc/100?u=29',
    quote: 'The collaborative projects taught me valuable team skills while learning new technologies.'
  },
  {
    name: 'Udeme Ita',
    role: 'Blockchain Lead',
    image: 'https://i.pravatar.cc/100?u=30',
    quote: 'The career guidance features helped me plan my learning path effectively.'
  },
  {
    name: 'Obongawan Udoh',
    role: 'Web3 Architect',
    image: 'https://i.pravatar.cc/100?u=31',
    quote: 'The interactive coding environments make learning programming languages much easier.'
  },
  {
    name: 'Unyime Etuk',
    role: 'DeFi Engineer',
    image: 'https://i.pravatar.cc/100?u=32',
    quote: 'The discussion forums are great for getting different perspectives and solutions.'
  },
  {
    name: 'Nkoyo Antigha',
    role: 'Smart Contract Dev',
    image: 'https://i.pravatar.cc/100?u=33',
    quote: 'The AI-powered code review system provides detailed feedback for improvement.'
  }
];

const TestimonialCard: React.FC<{ testimonial: typeof testimonialsData[0] }> = ({ testimonial }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-purple-200 transition-all flex-shrink-0 mx-2 my-3">
    <div className="flex items-center gap-1 mb-3">
      {[1,2,3,4,5].map(i => (
        <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
      ))}
    </div>
    <p className="text-gray-600 text-sm leading-relaxed mb-4">"{testimonial.quote}"</p>
    <div className="flex items-center gap-3">
      <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full" />
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
        <p className="text-xs text-gray-500">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

const ScrollingCarousel: React.FC<{ 
  testimonials: typeof testimonialsData; 
  direction: 'up' | 'down';
  speed: number;
}> = ({ testimonials, direction, speed }) => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];

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
      <div className={`carousel-container absolute w-full ${direction === 'up' ? 'scroll-up' : 'scroll-down'}`}>
        {duplicatedTestimonials.map((testimonial, idx) => (
          <div key={idx}>
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const oracleQuote = "The blockchain is the new highway of trust, connecting Africa to the future of decentralized finance.";

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('google_prompt_seen');
    if (!hasSeenPrompt && !authApi.isAuthenticated()) {
      const timer = setTimeout(() => setShowGooglePrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (window.google?.accounts) {
      setGoogleScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptLoaded(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (!googleScriptLoaded || !window.google?.accounts) {
      showError('Google Sign-In is not available. Please try email/password.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            if (!response.credential) throw new Error('No credential received');
            const backendResponse = await authApi.googleLogin(response.credential);
            const user: User = {
              id: backendResponse.user.id.toString(),
              name: backendResponse.user.full_name,
              email: backendResponse.user.email,
              role: mapBackendRoleToFrontend(backendResponse.user.role),
              avatar: backendResponse.user.profile_picture || undefined,
            };
            authApi.storeUser(user);
            localStorage.setItem('google_prompt_seen', 'true');
            showSuccess(`Welcome, ${user.name}!`);
            if (user.role === UserRole.SUPER_ADMIN) navigate('/super-admin');
            else if (user.role === UserRole.ADMIN) navigate('/admin');
            else if (user.role === UserRole.INSTRUCTOR) navigate('/tutor');
            else if (user.role === UserRole.INFLUENCER) navigate('/influencer');
            else navigate('/dashboard');
          } catch (err: any) {
            showError(getErrorMessage(err), 'Google Sign-In Failed');
            setIsGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
        }
      });
      setTimeout(() => { if (isGoogleLoading) setIsGoogleLoading(false); }, 10000);
    } catch {
      showError('Google Sign-In failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const dismissGooglePrompt = () => {
    setShowGooglePrompt(false);
    localStorage.setItem('google_prompt_seen', 'true');
  };

  return (
    <div className="relative overflow-hidden bg-gray-50">
      {/* Google Sign-In Prompt Modal */}
      {showGooglePrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismissGooglePrompt}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
            <button
              onClick={dismissGooglePrompt}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <i className="fab fa-google text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to AlphaKing Oracle</h3>
              <p className="text-sm text-gray-600 mb-6">
                Sign in with Google for instant access to courses, events, and your personalized learning dashboard.
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full py-3 border border-gray-300 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-gray-50 hover:shadow-md"
              >
                {isGoogleLoading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin text-gray-400"></i>
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <i className="fab fa-google text-red-500 text-lg"></i>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={dismissGooglePrompt}
                  className="py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity text-center"
                >
                  Sign in with Email
                </Link>
                <Link
                  to="/register"
                  onClick={dismissGooglePrompt}
                  className="py-2.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Create Account
                </Link>
              </div>

              <button
                onClick={dismissGooglePrompt}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later, just browse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-50 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-1/2 bg-green-50 blur-[120px] rounded-full -z-10"></div>
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-fadeIn">
            <span className="inline-flex items-center py-1 px-4 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-bold tracking-widest uppercase">
              <i className="fas fa-shield-alt mr-2"></i> Decentralizing Africa's Future
            </span>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter text-gray-900">
              The <span className="text-purple-600">Oracle</span> for Web3 Mastery.
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed font-medium">
              We provide the tools, education, and consulting required to navigate the frontier of blockchain technology. Expert-led, enterprise-ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/courses" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-green-700 to-blue-600 hover:from-purple-600 hover:to-purple-500 transition-all font-bold text-center text-white shadow-lg hover:shadow-purple-500/30">
                Get Started
              </Link>
              <Link to="/" className="px-10 py-5 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:text-purple-600 transition-all font-bold text-center text-gray-700 flex items-center justify-center gap-2">
                <i className="fas fa-sparkles text-purple-500"></i> New Experience
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block relative">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200 relative z-10 overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl border border-purple-100">
                  <i className="fas fa-terminal"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-gray-800">System Oracle</h3>
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest opacity-60">Status: Active</p>
                </div>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed font-light italic">
                "{oracleQuote}"
              </p>
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white" alt="learner" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-purple-50 border-2 border-white flex items-center justify-center text-[10px] text-purple-600 font-bold">+5k</div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Network</span>
                </div>
              </div>
            </div>
              
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-purple-100 rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-gray-100 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Network nodes', val: '5k+' },
            { label: 'Protocols', val: '24' },
            { label: 'Enterprises', val: '150+' },
            { label: 'Integrity', val: '100%' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-5xl font-black text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">{stat.val}</div>
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">Powerful <span className="text-purple-600">Features</span></h2>
            <p className="text-gray-600 font-medium max-w-2xl mx-auto">
              Experience a revolutionary platform that combines the best of traditional learning with the power of blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: 'fa-microchip',
                title: 'AI-Powered Guidance',
                description: 'Our AI assistant helps you discover the right path for your education, career, or personal growth.',
                bg: 'bg-purple-50',
                iconBg: 'bg-purple-100',
                text: 'text-purple-600'
              },
              {
                icon: 'fa-graduation-cap',
                title: 'Smart Exam Simulation',
                description: 'Get ready for certifications with realistic simulations of professional exams and assessments.',
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100',
                text: 'text-blue-600'
              },
              {
                icon: 'fa-book-open',
                title: 'Interactive Courses',
                description: 'Engaging courses with videos, quizzes, and hands-on projects to accelerate your learning journey.',
                bg: 'bg-green-50',
                iconBg: 'bg-green-100',
                text: 'text-green-600'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`${feature.bg} rounded-[2.5rem] p-10 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500`}>
                <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center ${feature.text} text-2xl mb-8`}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Technical <span className="text-purple-600">Intelligence</span></h2>
              <p className="text-gray-600 font-medium">Deep-dive technical programs designed to turn developers into blockchain architects.</p>
            </div>
            <Link to="/courses" className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-3 group px-6 py-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-all">
              Technical Catalog <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {MOCK_COURSES.map(course => (
              <div key={course.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl hover:shadow-gray-200/50 group hover:border-purple-200 transition-all duration-500">
                <div className="relative h-52 overflow-hidden">
                  <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-purple-600 uppercase tracking-widest border border-gray-100">
                    {course.level}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">{course.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">₦{course.price}</span>
                    <button className="w-12 h-12 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 transition-all flex items-center justify-center border border-purple-100">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section with Independent Auto-Scrolling Carousels */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">What Our <span className="text-purple-600">Students</span> Say</h2>
            <p className="text-gray-600 font-medium max-w-2xl mx-auto">
              Join thousands of satisfied learners who have transformed their careers with AlphaKing Oracle
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-3 gap-8 hidden">
            <ScrollingCarousel testimonials={testimonialsData} direction="up" speed={35} />
            <ScrollingCarousel testimonials={testimonialsData2} direction="down" speed={35} />
            <ScrollingCarousel testimonials={testimonialsData3} direction="up" speed={35} />
          </div>

          <div className="lg:hidden">
            <ScrollingCarousel 
              testimonials={[...testimonialsData, ...testimonialsData2, ...testimonialsData3]} 
              direction="up" 
              speed={50} 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-700 to-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Ready to Transform Your Future?</h2>
          <p className="text-white/80 font-medium max-w-2xl mx-auto mb-10">
            Join thousands of learners who have achieved their goals with AlphaKing Oracle. Take the first step toward your future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/courses" className="px-10 py-5 rounded-2xl bg-white text-purple-700 hover:bg-purple-50 transition-all font-bold text-center shadow-xl">
              Join Course
            </Link>
            <Link to="/consulting" className="px-10 py-5 rounded-2xl border-2 border-white text-white hover:bg-white hover:text-purple-700 transition-all font-bold text-center">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
