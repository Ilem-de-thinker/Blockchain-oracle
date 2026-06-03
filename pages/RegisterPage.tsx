import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authApi, mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '../src/api/auth';
import { useToast } from '../src/hooks/useToast';
import { getErrorMessage, getFieldErrors } from '../src/api/errorHandler';
import { useTheme } from '../contexts/ThemeContext';

const RegisterPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError, success: showSuccess } = useToast();
  const { themeMode, buttonColor } = useTheme();
  
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
    referralCode: getReferralCodeFromUrl(),
    userCategory: 'user' as 'nysc' | 'user',
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
        ...(formData.role === UserRole.LEARNER && { user_category: formData.userCategory }),
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Register Card */}
      <div className="relative w-full max-w-[400px] z-10">
        <div className="relative backdrop-blur-xl bg-surface/80 border border-border/50 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-7">
            {/* Logo & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg mb-3 bg-surface-alt border border-border/50 shadow-sm">
                <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-text tracking-tight">Create Account</h2>
              <p className="text-text-muted mt-0.5 text-xs">Join our professional learning network</p>
            </div>

            {/* Progress Bar - Minimalist */}
            <div className="flex items-center justify-between gap-1 mb-6 px-1">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 h-1 rounded-full overflow-hidden bg-surface-alt border border-border/30">
                  <div 
                    className={`h-full transition-all duration-500 ${currentStep >= step ? 'bg-primary' : 'bg-transparent'}`}
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
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                        First Name
                      </label>
                      <div className="relative">
                        <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.firstName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                          placeholder="John"
                        />
                      </div>
                      {fieldErrors.firstName && (
                        <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.firstName[0]}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.lastName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                          placeholder="Doe"
                        />
                      </div>
                      {fieldErrors.lastName && (
                        <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.lastName[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                        placeholder="name@company.com"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                        Role
                      </label>
                      <div className="relative">
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full pl-3 pr-8 py-2.5 text-sm rounded-lg border border-border bg-surface-alt/50 text-text appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="learner">Learner</option>
                          <option value="instructor">Instructor</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px] pointer-events-none"></i>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                        Referral
                      </label>
                      <input
                        type="text"
                        name="referralCode"
                        value={formData.referralCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-primary transition-all duration-200 shadow-sm active:scale-[0.99]"
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
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                      >
                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-check-circle absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
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
                      className="flex-1 py-2.5 rounded-lg font-bold text-xs border border-border bg-surface-alt/30 hover:bg-surface-alt/50 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-[2] py-2.5 rounded-lg font-bold text-sm text-white transition-all duration-200 shadow-sm active:scale-[0.99]"
                      style={{ backgroundColor: buttonColor }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Final Review */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-lg bg-surface-alt/50 border border-border/50 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Name</span>
                      <span className="text-text font-bold truncate max-w-[140px]">{`${formData.firstName} ${formData.lastName}`}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Account</span>
                      <span className="text-text font-bold truncate max-w-[140px]">{formData.email}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Role</span>
                      <span className="text-text font-bold capitalize">{formData.role}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-text-muted px-2">
                    By joining, you agree to our{' '}
                    <a href="#" className="text-primary font-bold hover:underline">Terms</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-2.5 rounded-lg font-bold text-xs border border-border bg-surface-alt/30 hover:bg-surface-alt/50 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-2.5 rounded-lg font-bold text-sm text-white bg-primary transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Finish Setup'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Sign In Link */}
            <p className="text-center text-[11px] mt-6 text-text-muted">
              Already a member?{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
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
