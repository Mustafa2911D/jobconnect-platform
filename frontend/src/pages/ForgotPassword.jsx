import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { showToast } from '../utils/toast.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        showToast('Password reset link sent to your email', 'success');
      } else {
        showToast(data.message || 'Error sending reset link', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-500 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-6 transform transition-all duration-500 hover:scale-110">
              <CheckCircle className="h-10 w-10 text-green-600 transform transition-transform duration-300 hover:scale-110" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If an account with <strong className="text-gray-900">{email}</strong> exists, we've sent a password reset link to your email address.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-7 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm font-semibold text-blue-800">Security Notice</p>
              </div>
              <p className="text-sm text-blue-700">
                The reset link will expire in 10 minutes for security reasons.
              </p>
            </div>
            <div className="space-y-5">
              <Link
                to="/login"
                className="group w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-700 hover:to-green-600 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-3 transform transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Login
              </Link>
              <p className="text-sm text-gray-600">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-semibold text-green-600 hover:text-green-700 transition-all duration-300 transform hover:scale-105 hover:underline"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-500 animate-fade-in">
        <div className="text-center">
          <Link
            to="/login"
            className="group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-7 transition-all duration-300 transform hover:translate-x-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transform transition-transform duration-300 group-hover:-translate-x-1" />
            Back to login
          </Link>
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-600 to-blue-700 mb-7 transform transition-all duration-500 hover:scale-110 hover:shadow-lg">
            <Mail className="h-9 w-9 text-white transform transition-transform duration-300 hover:scale-110" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Forgot Password?
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        <form className="space-y-7" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300">
                <Mail className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all duration-500 bg-white shadow-sm hover:shadow-md group-hover:border-gray-400"
                placeholder="Enter your email address"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 to-blue-500/0 group-hover:from-green-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-3 focus:ring-green-500/40 focus:ring-offset-2 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="animate-pulse">Sending reset link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <Mail className="h-5 w-5 ml-3 transform transition-transform duration-300 group-hover:scale-110" />
              </>
            )}
          </button>
        </form>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 transform transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5 transform transition-transform duration-300 hover:scale-110" />
            <div className="ml-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Security Tip</p>
              <p className="text-sm text-amber-700">
                The password reset link will expire in 10 minutes for your protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;