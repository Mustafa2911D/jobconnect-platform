import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles, Users, Briefcase, CheckCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Event Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const quickLogin = (email, password) => {
    setFormData({ email, password });
    // Add visual feedback for quick login selection
    const buttons = document.querySelectorAll('.quick-login-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
  };

  // Constants
  const quickLoginOptions = [
    { 
      email: 'employer@example.com', 
      password: 'password123', 
      label: 'Employer', 
      icon: Briefcase, 
      color: 'blue' 
    },
    { 
      email: 'candidate@example.com', 
      password: 'password123', 
      label: 'Candidate', 
      icon: Users, 
      color: 'green' 
    }
  ];

  const features = [
    { icon: Sparkles, text: 'AI-powered job matching' },
    { icon: Users, text: 'Connect with top companies' },
    { icon: Briefcase, text: 'Instant application tracking' }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 hero-pattern">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full opacity-60"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-50 rounded-full opacity-40"></div>
        
        <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-lg">
          {/* Animated Logo/Header */}
          <div className="text-center mb-12 transform transition-all duration-500 hover:scale-105">
            <div className="relative inline-block mb-6 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/25 mx-auto transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-600/40">
                <Sparkles className="h-8 w-8 text-white transform transition-transform duration-700 group-hover:rotate-180" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full border-4 border-white animate-pulse group-hover:animate-ping"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent mb-3 transform transition-all duration-300 text-glow">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg transition-colors duration-300">
              Sign in to continue your journey
            </p>
          </div>

          {/* Quick Login Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {quickLoginOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => quickLogin(option.email, option.password)}
                className={`quick-login-btn p-4 bg-gradient-to-br from-${option.color}-50 to-${option.color}-100 border-2 border-${option.color}-200 rounded-xl hover:border-${option.color}-600 transition-all duration-300 hover:shadow-lg group relative overflow-hidden card transform hover:scale-105`}
              >
                <div className={`absolute inset-0 bg-${option.color}-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <option.icon className={`h-6 w-6 text-${option.color}-800 mb-2 mx-auto group-hover:scale-110 transition-transform duration-300`} />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{option.label}</span>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-${option.color}-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500 transition-colors duration-300 hover:text-gray-700 transform hover:scale-110">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
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

              {/* Password Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-green-600">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-green-600 hover:text-green-500 transition-all duration-300 transform hover:scale-105"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg transform hover:scale-105 relative z-10"
                    placeholder="Enter your password"
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
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

          {/* Sign Up Link */}
          <div className="mt-8 text-center transform transition-all duration-300 hover:scale-105">
            <p className="text-gray-600 transition-colors duration-300">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-green-600 hover:text-green-500 transition-all duration-200 inline-flex items-center group"
              >
                Sign up now
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 to-blue-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
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
                Find Your Perfect <span className="text-yellow-300 animate-pulse">Career Match</span>
              </h2>
              <p className="text-xl text-white/90 leading-relaxed transition-all duration-300 hover:text-white">
                Join thousands of professionals and companies already using our platform to transform their hiring experience.
              </p>
            </div>
            
            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center text-white/90 group transform transition-all duration-300 hover:translate-x-2 hover:text-white"
                >
                  <feature.icon className="h-6 w-6 mr-4 group-hover:scale-110 transition-transform duration-200 group-hover:text-yellow-300" />
                  <span className="text-lg transition-colors duration-200">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;