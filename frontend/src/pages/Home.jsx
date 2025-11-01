import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../api/apiClient.js';
import JobCard from '../components/JobCard.jsx';
import { 
  Search, MapPin, Building, TrendingUp, Users, Award, Star, 
  ArrowRight, Play, Target, Zap, Sparkles, Rocket, Globe,
  Shield, Heart, Briefcase, ArrowUpRight, CheckCircle, Plus 
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Constants
  const provinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'];
  const popularCities = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'];

  const stats = [
    { number: '50,000+', label: 'Active Jobs', icon: Building, color: 'from-green-500 to-emerald-600' },
    { number: '15,000+', label: 'Companies', icon: Users, color: 'from-blue-500 to-cyan-600' },
    { number: '500,000+', label: 'Job Seekers', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { number: '95%', label: 'Success Rate', icon: Award, color: 'from-red-500 to-pink-600' }
  ];

  const features = [
    {
      icon: Target,
      title: 'B-BBEE Compliant',
      description: 'Jobs that support Broad-Based Black Economic Empowerment',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Verified Employers',
      description: 'All companies are thoroughly vetted and verified',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Globe,
      title: 'Nationwide Reach',
      description: 'Jobs across all 9 South African provinces',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Zap,
      title: 'Quick Applications',
      description: 'Apply to jobs in just a few clicks',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Effects
  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  // API Functions
  const fetchFeaturedJobs = async () => {
    try {
      const [featuredResponse, trendingResponse] = await Promise.all([
        apiClient.get('/jobs?limit=6'),
        apiClient.get('/jobs?limit=4')
      ]);
      setFeaturedJobs(featuredResponse.data.jobs || []);
      setTrendingJobs(trendingResponse.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setFeaturedJobs([]);
      setTrendingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions
  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    return `${location.city}, ${location.province}`;
  };

  // Event Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedProvince) {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedProvince) params.append('province', selectedProvince);
      window.location.href = `/jobs?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-blue-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105">
              <span className="text-sm font-semibold">South Africa's #1 Job Platform</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              Find Your{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient">
                Dream Job
              </span>{' '}
              in SA
            </h1>
            
            <p className="text-xl lg:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Connect with top South African employers. Discover opportunities across all provinces. 
              Build your career right here at home with our AI-powered job matching.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
                <div className="flex flex-col lg:flex-row gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sa-green border-0"
                        placeholder="Job title, skills, or company..."
                      />
                    </div>
                  </div>
                  
                  <div className="lg:w-64">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sa-green border-0 appearance-none"
                      >
                        <option value="">All Provinces</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-secondary lg:w-auto px-8"
                  >
                    Search Jobs
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Province Links */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedProvince(city.includes('Johannesburg') || city.includes('Pretoria') ? 'Gauteng' : 
                                      city.includes('Cape') ? 'Western Cape' : 
                                      city.includes('Durban') ? 'KwaZulu-Natal' : 
                                      city.includes('Port Elizabeth') ? 'Eastern Cape' :
                                      city.includes('Bloemfontein') ? 'Free State' :
                                      '');
                    setSearchQuery(city);
                  }}
                  className="group px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-white/20 hover:border-white/40"
                >
                  <span className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{city}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/register" 
                    className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl text-lg"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <Rocket className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span>Start Your Journey</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <Link 
                    to="/login" 
                    className="group border-2 border-white text-white hover:bg-white hover:text-black font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-lg transform hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <Play className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </>
              ) : (
                <Link 
                  to={user?.role === 'employer' ? '/employer/all-applications' : '/jobs'} 
                  className="group relative bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl text-lg"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span>{user?.role === 'employer' ? 'Manage Jobs' : 'Browse Opportunities'}</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`relative w-20 h-20 bg-gradient-to-r ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 transform ${
                  hoveredFeature === index ? 'scale-110 rotate-12 shadow-2xl' : 'shadow-lg'
                }`}>
                  <stat.icon className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Built for <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">South African</span> Talent
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our platform is designed specifically for the South African job market, 
              with features that matter to local job seekers and employers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative"
                onMouseEnter={() => setHoveredFeature(`feature-${index}`)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="bg-white py-24 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16">
            <div className="mb-8 lg:mb-0">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Featured <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">SA Jobs</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Hand-picked opportunities from top South African companies
              </p>
            </div>
            <Link
              to="/jobs"
              className="group flex items-center space-x-3 btn-secondary text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <span>View All Jobs</span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="h-24 bg-gray-200 rounded mb-6"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          <div className="text-center mt-12 lg:hidden">
            <Link 
              to="/jobs" 
              className="btn-primary text-lg px-8 py-4 transform hover:-translate-y-1 transition-all duration-300"
            >
              Explore All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Jobs Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-blue-800 text-white py-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-white">
              Trending <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Now</span> in SA
            </h2>
            <p className="text-white/80 text-xl max-w-2xl mx-auto">
              Most viewed and applied jobs this week across South Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trendingJobs.map((job, index) => (
              <div 
                key={job._id} 
                className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                      {job.title}
                    </h3>
                    <p className="text-white/80 text-lg font-medium">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-500/30">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-white/60 text-sm mb-6">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{formatLocation(job.location)}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">{job.type}</span>
                  </div>
                </div>
                <p className="text-white/70 text-lg leading-relaxed mb-6 line-clamp-2">
                  {job.description && job.description.substring(0, 120)}...
                </p>
                <Link
                  to={`/jobs/${job._id}`}
                  className="group/view inline-flex items-center space-x-3 text-yellow-400 hover:text-yellow-300 font-semibold text-lg transition-all duration-300"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover/view:translate-x-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center space-x-2 bg-green-600/10 text-green-600 rounded-full px-6 py-3 mb-8 border border-green-600/20">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Join Thousands of Successful Job Seekers</span>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-8">
            Ready to Build Your <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">South African</span> Career?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who found their dream job through JobConnect. 
            Your next career opportunity is waiting right here in South Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/register" 
                  className="group relative btn-primary text-white font-bold py-5 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-lg"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <Rocket className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span>Create Free Account</span>
                  </span>
                </Link>
                <Link 
                  to="/jobs" 
                  className="group border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold py-5 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl text-lg"
                >
                  <span className="flex items-center space-x-3">
                    <Briefcase className="h-6 w-6" />
                    <span>Browse Jobs</span>
                  </span>
                </Link>
              </>
            ) : user?.role === 'employer' ? (
              <Link 
                to="/employer/jobs/new" 
                className="group relative btn-primary text-white font-bold py-5 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-lg"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Plus className="h-6 w-6" />
                  <span>Post a Job</span>
                </span>
              </Link>
            ) : (
              <Link 
                to="/jobs" 
                className="group relative bg-gradient-to-r btn-primary text-white font-bold py-5 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl text-lg"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Target className="h-6 w-6" />
                  <span>Find Your Next Role</span>
                </span>
              </Link>
            )}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Secure Platform', icon: Shield },
              { label: '24/7 Support', icon: Heart },
              { label: 'Easy Apply', icon: CheckCircle },
              { label: 'Career Growth', icon: TrendingUp }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-600">
                <item.icon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

            <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Home;