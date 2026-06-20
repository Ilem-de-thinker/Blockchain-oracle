import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '@/types';
import { authApi, mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '@/src/api/auth';
import { useToast } from '@/src/hooks/useToast';
import { getErrorMessage, getFieldErrors } from '@/src/api/errorHandler';
const RegisterPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError, success: showSuccess } = useToast();
  
  const getReferralCodeFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('ref') || params.get('refer') || params.get('referral') || '';
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner' as UserRole,
    userType: 'user' as 'user' | 'learner',
    referralCode: getReferralCodeFromUrl(),
    onboardingFee: '',
    country: 'Nigeria',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.firstName.trim()) {
        setFieldErrors({ firstName: ['First name is required'] });
        return false;
      }
      if (!formData.lastName.trim()) {
        setFieldErrors({ lastName: ['Last name is required'] });
        return false;
      }
      if (!formData.email.trim()) {
        setFieldErrors({ email: ['Email is required'] });
        return false;
      }
    }
    if (step === 2) {
      if (formData.password.length < 8) {
        setFieldErrors({ password: ['Password must be at least 8 characters'] });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors({ confirmPassword: ['Passwords do not match'] });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.referralCode.trim() && !/^[A-Z0-9\-]+$/i.test(formData.referralCode.trim())) {
      setFieldErrors({ referralCode: ['Invalid referral code format'] });
      return;
    }

    setIsLoading(true);

    try {
      const onboardingFeeValue = formData.onboardingFee.trim();
      const onboardingFeeNumber = onboardingFeeValue ? Number(onboardingFeeValue) : null;
      const registerPayload = {
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: mapFrontendRoleToBackend(formData.role),
        ...(formData.country.trim() && { country: formData.country.trim() }),
        ...(formData.role === UserRole.LEARNER && { user_category: 'user' }),
        ...(onboardingFeeNumber !== null && Number.isFinite(onboardingFeeNumber) && onboardingFeeNumber >= 0
          ? { onboarding_fee: onboardingFeeNumber }
          : {}),
        ...(formData.referralCode.trim() && { referred_by: formData.referralCode.trim() }),
      };

      await authApi.register(registerPayload);

      const loginResponse = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      const user: User = {
        id: loginResponse.user.id.toString(),
        name: loginResponse.user.full_name,
        email: loginResponse.user.email,
        role: mapBackendRoleToFrontend(loginResponse.user.role),
        avatar: loginResponse.user.profile_picture || undefined,
      };

      authApi.storeUser(user);
      onLogin(user);
      showSuccess('Account created successfully! Welcome aboard.');
      navigate(
        user.role === UserRole.SUPER_ADMIN ? '/super-admin'
        : user.role === UserRole.ADMIN ? '/admin'
        : user.role === UserRole.INSTRUCTOR ? '/tutor'
        : user.role === UserRole.INFLUENCER ? '/influencer'
        : '/dashboard'
      );
    } catch (err: any) {
      const parsed = getFieldErrors(err);
      if (parsed) {
        setFieldErrors(parsed);
      }
      showError(getErrorMessage(err), 'Registration Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Split Card */}
      <div className="relative w-full max-w-4xl z-10">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Side - Branding (hidden on mobile) */}
          <div className="hidden md:flex relative md:w-[45%] bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-8 sm:p-10 lg:p-12 flex-col items-center justify-center text-center min-h-[600px]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-16 h-16 object-contain mx-auto mb-6 brightness-0 invert" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em', fontFamily: "'Montserrat', sans-serif" }}>0</span>racle</h1>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed max-w-xs">
                Decentralized intelligence for the modern blockchain ecosystem
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                <span className="text-purple-200 text-xs font-medium">Secure &bull; Decentralized &bull; Fast</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-[55%] p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Logo for mobile */}
              <div className="text-center mb-6 md:hidden">
                <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-12 h-12 object-contain mx-auto mb-3" />
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors mb-4 w-fit"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                <p className="text-gray-500 mt-1 text-sm">Join our professional learning network</p>
              </div>

              {/* Progress Bar - Minimalist */}
              <div className="flex items-center justify-between gap-1 mb-6 px-1">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100 border border-gray-200/30">
                    <div 
                      className={`h-full transition-all duration-500 ${currentStep >= step ? 'bg-purple-600' : 'bg-transparent'}`}
                    />
                  </div>
                ))}
              </div>

              <form className="space-y-4" onSubmit={handleRegister}>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                          First Name
                        </label>
                        <div className="relative">
                          <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${fieldErrors.firstName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'}`}
                            placeholder="John"
                          />
                        </div>
                        {fieldErrors.firstName && (
                          <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.firstName[0]}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                          Last Name
                        </label>
                        <div className="relative">
                          <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${fieldErrors.lastName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'}`}
                            placeholder="Doe"
                          />
                        </div>
                        {fieldErrors.lastName && (
                          <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.lastName[0]}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${fieldErrors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="name@company.com"
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.email[0]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                          Role
                        </label>
                        <div className="relative">
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full pl-3 pr-8 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          >
                            <option value="learner">Learner</option>
                            <option value="instructor">Instructor</option>
                          </select>
                          <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                          Referral
                        </label>
                        <input
                          type="text"
                          name="referralCode"
                          value={formData.referralCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        User Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, userType: 'user' })}
                          className={`py-2.5 text-sm rounded-lg border transition-all duration-200 font-bold ${
                            formData.userType === 'user'
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          User
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, userType: 'learner' })}
                          className={`py-2.5 text-sm rounded-lg border transition-all duration-200 font-bold ${
                            formData.userType === 'learner'
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          Learner
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-purple-600 hover:brightness-110 transition-all duration-200 shadow-sm active:scale-[0.99]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Continue
                        <i className="fas fa-arrow-right text-[10px]"></i>
                      </span>
                    </button>
                  </div>
                )}

                {/* Step 2: Security */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className={`w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Min. 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <i className="fas fa-check-circle absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className={`w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${fieldErrors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.confirmPassword[0]}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-2.5 rounded-lg font-bold text-xs border border-gray-300 bg-gray-50/30 hover:bg-gray-50 transition-all duration-200 text-gray-700"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-[2] py-2.5 rounded-lg font-bold text-sm text-white bg-purple-600 hover:brightness-110 transition-all duration-200 shadow-sm active:scale-[0.99]"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Final Review */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-900 font-bold truncate max-w-[140px]">{`${formData.firstName} ${formData.lastName}`}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Account</span>
                        <span className="text-gray-900 font-bold truncate max-w-[140px]">{formData.email}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Role</span>
                        <span className="text-gray-900 font-bold capitalize">{formData.role}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Type</span>
                        <span className="text-gray-900 font-bold capitalize">{formData.userType}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-center text-gray-500 px-2">
                      By joining, you agree to our{' '}
                      <a href="#" className="text-purple-600 font-bold hover:underline">Terms</a>
                      {' '}and{' '}
                      <a href="#" className="text-purple-600 font-bold hover:underline">Privacy Policy</a>
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-2.5 rounded-lg font-bold text-xs border border-gray-300 bg-gray-50/30 hover:bg-gray-50 transition-all duration-200 text-gray-700"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] py-2.5 rounded-lg font-bold text-sm text-white bg-purple-600 hover:brightness-110 transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50"
                      >
                        {isLoading ? 'Creating...' : 'Finish Setup'}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Sign In Link */}
              <p className="text-center text-[11px] mt-6 text-gray-500">
                Already a member?{' '}
                <Link
                  to="/login"
                  className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
