import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, User, Building, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

const Register = () => {
  // State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Hooks
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  // Constants
  const heroContent = {
    candidate: {
      title: "Start Your Success Story",
      highlightedWord: "Success Story",
      description: "Join our community of professionals and discover opportunities that match your skills and ambitions.",
      benefits: [
        "Create your professional profile",
        "Get matched with ideal opportunities",
        "Connect with industry leaders"
      ]
    },
    employer: {
      title: "Find Your Perfect Talent",
      highlightedWord: "Perfect Talent",
      description: "Join thousands of companies finding their next great hire through our platform.",
      benefits: [
        "Post jobs and reach qualified candidates",
        "Access our talent matching algorithm",
        "Streamline your hiring process"
      ]
    }
  };

  const currentHero = heroContent[formData.role];

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains number', met: /[0-9]/.test(formData.password) },
  ];

  // Utility Functions
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 hero-pattern">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 to-blue-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 -translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 translate-x-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/3 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full float-animation"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12">
          <div className="max-w-lg transform transition-all duration-500 hover:scale-105">
            <div className="mb-8">
              <div className="w-20 h-1 bg-white/30 rounded-full mb-6 transform transition-all duration-500 hover:scale-x-110"></div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight transform transition-all duration-300 hover:translate-x-2 text-glow">
                {formData.role === 'candidate' ? 'Start Your ' : 'Find Your '}
                <span className="text-yellow-300 animate-pulse">{currentHero.highlightedWord}</span>
              </h2>
              <p className="text-xl text-white/90 leading-relaxed transition-all duration-300 hover:text-white">
                {currentHero.description}
              </p>
            </div>
            
            {/* Benefits List */}
            <div className="space-y-4">
              {currentHero.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-white/90 group transform transition-all duration-300 hover:translate-x-2 hover:text-white">
                  <CheckCircle className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform duration-200 group-hover:text-yellow-300" />
                  <span className="text-lg transition-colors duration-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-50 rounded-full opacity-60"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-50 rounded-full opacity-40"></div>
        
        <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-lg">
          {/* Animated Logo/Header */}
          <div className="text-center mb-12 transform transition-all duration-500 hover:scale-105">
            <div className="relative inline-block mb-6 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/25 mx-auto transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-600/40">
                <Sparkles className="h-8 w-8 text-white transform transition-transform duration-700 group-hover:rotate-180" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-800 rounded-full border-4 border-white animate-pulse group-hover:animate-ping"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent mb-3 transform transition-all duration-300 text-glow">
              Join Us Today
            </h1>
            <p className="text-gray-600 text-lg transition-colors duration-300">
              Create your {formData.role === 'candidate' ? 'professional' : 'employer'} account in seconds
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-fade-in transform transition-all duration-300 hover:shadow-md card">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 animate-pulse" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Name Field */}
              <div className="group">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-hover:text-green-600">
                  {formData.role === 'candidate' ? 'Full Name' : 'Your Name'}
                </label>
                <div className="relative transform transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <User className={`h-5 w-5 transition-all duration-300 ${
                      focusedField === 'name' ? 'text-green-600 scale-110' : 'text-gray-500'
                    } group-hover:text-green-600`} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={handleBlur}
                    className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-105 relative z-10"
                    placeholder={formData.role === 'candidate' ? "Enter your full name" : "Enter your name"}
                  />
                  {formData.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-20">
                      <CheckCircle className="h-5 w-5 text-green-600 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-hover:text-green-600">
                  Email address
                </label>
                <div className="relative transform transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <Mail className={`h-5 w-5 transition-all duration-300 ${
                      focusedField === 'email' ? 'text-green-600 scale-110' : 'text-gray-500'
                    } group-hover:text-green-600`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-105 relative z-10"
                    placeholder="Enter your email"
                  />
                  {formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-20">
                      <CheckCircle className="h-5 w-5 text-green-600 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'candidate', label: 'Job Seeker', icon: User },
                    { value: 'employer', label: 'Employer', icon: Building }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'role', value: option.value } })}
                      className={`py-4 px-4 border-2 rounded-xl text-sm font-medium transition-all duration-300 group card transform hover:scale-105 ${
                        formData.role === option.value
                          ? 'border-green-600 bg-green-50 text-green-700 shadow-md transform scale-[1.02]'
                          : 'border-gray-300 bg-white/80 text-gray-700 hover:border-gray-400 hover:shadow-lg'
                      }`}
                    >
                      <option.icon className={`h-5 w-5 mx-auto mb-2 transition-colors duration-200 group-hover:scale-110 ${
                        formData.role === option.value ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Field (for employers) */}
              {formData.role === 'employer' && (
                <div className="animate-fade-in">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-hover:text-green-600">
                    Company Name
                  </label>
                  <div className="relative transform transition-all duration-300 group-hover:scale-105">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                      <Building className={`h-5 w-5 transition-all duration-300 ${
                        focusedField === 'company' ? 'text-green-600 scale-110' : 'text-gray-500'
                      } group-hover:text-green-600`} />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required={formData.role === 'employer'}
                      value={formData.company}
                      onChange={handleChange}
                      onFocus={() => handleFocus('company')}
                      onBlur={handleBlur}
                      className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-105 relative z-10"
                      placeholder="Enter your company name"
                    />
                    {formData.company && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-20">
                        <CheckCircle className="h-5 w-5 text-green-600 animate-bounce" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-hover:text-green-600">
                  Password
                </label>
                <div className="relative transform transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <Lock className={`h-5 w-5 transition-all duration-300 ${
                      focusedField === 'password' ? 'text-green-600 scale-110' : 'text-gray-500'
                    } group-hover:text-green-600`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-105 relative z-10"
                    placeholder="Create your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 hover:text-gray-600 transform hover:scale-110 z-20"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 transition-colors duration-300 hover:text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 transition-colors duration-300 hover:text-gray-700" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-3 space-y-2 transform transition-all duration-500">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Password strength</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center text-xs transform transition-all duration-300 hover:scale-105">
                          <CheckCircle 
                            className={`h-3 w-3 mr-1 transition-colors duration-300 ${
                              req.met ? 'text-green-600 animate-bounce' : 'text-gray-300'
                            }`} 
                          />
                          <span className={`transition-colors duration-300 ${req.met ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-hover:text-green-600">
                  Confirm Password
                </label>
                <div className="relative transform transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <Lock className={`h-5 w-5 transition-all duration-300 ${
                      focusedField === 'confirmPassword' ? 'text-green-600 scale-110' : 'text-gray-500'
                    } group-hover:text-green-600`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                    className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-105 relative z-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 hover:text-gray-600 transform hover:scale-110 z-20"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 transition-colors duration-300 hover:text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 transition-colors duration-300 hover:text-gray-700" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="mt-2 flex items-center text-green-600 text-sm animate-fade-in">
                    <CheckCircle className="h-4 w-4 mr-1 animate-bounce" />
                    Passwords match
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full relative overflow-hidden flex items-center justify-center py-4 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-800 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-green-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create {formData.role === 'candidate' ? 'professional' : 'employer'} account
                    <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                  </>
                )}
              </div>
              {/* Ripple effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center transform transition-all duration-300 hover:scale-105">
            <p className="text-gray-600 transition-colors duration-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-green-600 hover:text-green-500 transition-all duration-200 inline-flex items-center group"
              >
                Sign in here
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;