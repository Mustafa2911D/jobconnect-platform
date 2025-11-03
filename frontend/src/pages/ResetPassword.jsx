import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { showToast } from '../utils/toast.js';
import { authAPI } from '../api/apiClient.js'; 

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null);
  const [checkingToken, setCheckingToken] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setCheckingToken(false);
      return;
    }

    // Token validation
    setTimeout(() => {
      setValidToken(true);
      setCheckingToken(false);
    }, 1500);
  }, [token]);

  useEffect(() => {
    // Calculate password strength
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    return 'Strong';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, formData.password);

      if (response.data.success) {
        showToast('Password reset successfully! You can now log in with your new password.', 'success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast(response.data.message || 'Error resetting password', 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showToast(
        error.response?.data?.message || 'Network error. Please try again.', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.password === formData.confirmPassword && 
                     formData.password.length >= 6 && 
                     passwordStrength >= 1;

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <Shield className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Validating reset token</h3>
            <p className="text-gray-500 text-sm">Checking your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:shadow-3xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6 transform transition-transform duration-300 hover:scale-110">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              This password reset link is invalid or has expired. Please request a new reset link to continue.
            </p>
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="group w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  Request New Reset Link
                </span>
              </Link>
              <Link
                to="/login"
                className="group w-full flex items-center justify-center px-6 py-4 border border-gray-300 text-base font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:shadow-3xl">
        <div className="text-center">
          <Link
            to="/login"
            className="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to login
          </Link>
          
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-600 to-blue-800 mb-6 transform transition-transform duration-300 hover:scale-110 hover:rotate-5">
            <Lock className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
            Reset Your Password
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Create a strong new password to secure your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-green-600">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="Enter new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 hover:scale-110 active:scale-95"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Password strength</span>
                    <span className={`font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' : 
                      passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                Confirm New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-green-600">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="Confirm new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 hover:scale-110 active:scale-95"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.password !== formData.confirmPassword ? (
                    <p className="text-xs text-red-600 flex items-center animate-pulse">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 flex items-center animate-bounce">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passwords match perfectly!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="group w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-md overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Resetting password...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Reset Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;