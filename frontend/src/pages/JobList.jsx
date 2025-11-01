import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient.js';
import JobCard from '../components/JobCard.jsx';
import { 
  Search, Filter, MapPin, Briefcase, X, Loader, 
  Sparkles, Target, Zap, ArrowLeft, ArrowRight, 
  TrendingUp, Building, Users, Award
} from 'lucide-react';

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || ''
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasFilters, setHasFilters] = useState(false);
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Constants
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  // Effects
  useEffect(() => {
    const hasActiveFilters = filters.search || filters.location || filters.type;
    setHasFilters(hasActiveFilters);
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, currentPage]);

  // API Functions
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchParams.get('search')) params.append('search', searchParams.get('search'));
      if (searchParams.get('location')) params.append('location', searchParams.get('location'));
      if (searchParams.get('type')) params.append('type', searchParams.get('type'));
      params.append('page', currentPage);
      params.append('limit', 9);

      const response = await apiClient.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `R ${(salary.min / 1000).toFixed(0)}k - R ${(salary.max / 1000).toFixed(0)}k ${salary.period === 'annually' ? 'p.a.' : salary.period}`;
    }
    return 'Salary not specified';
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  // Event Handlers
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '' });
    setSearchParams({});
    setCurrentPage(1);
  };

  const clearSingleFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: '' };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    params.delete(filterKey);
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Reusable Components
  const InputField = ({ label, icon: Icon, value, onChange, onKeyPress, placeholder, type = "text", className = "" }) => (
    <div className={`group ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-green-600 group-focus-within:text-green-600 z-10" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={placeholder}
          className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
        />
        {value && (
          <button
            onClick={() => clearSingleFilter(type === 'text' ? (label.includes('Search') ? 'search' : 'location') : 'type')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  const SelectField = ({ label, icon: Icon, value, onChange, options, className = "" }) => (
    <div className={`group ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-green-600 group-focus-within:text-green-600 z-10 pointer-events-none" />}
        <select
          value={value}
          onChange={onChange}
          className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 appearance-none cursor-pointer"
        >
          <option value="">All Job Types</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full px-6 py-3 mb-6 shadow-lg">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Find Your Perfect Role</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Discover Amazing Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Browse through thousands of curated job listings from top South African companies
          </p>
        </div>

        {/* Filters Card */}
        <div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 mb-12"
          onMouseEnter={() => setHoveredFilter('card')}
          onMouseLeave={() => setHoveredFilter(null)}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <span>Refine Your Search</span>
            </h2>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="group flex items-center space-x-2 px-4 py-2 text-gray-500 hover:text-green-600 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <X className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Clear all</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <InputField
              label="Search Jobs"
              icon={Search}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Job title, company, or keywords"
            />

            <InputField
              label="Location"
              icon={MapPin}
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="City, province, or remote"
            />

            <SelectField
              label="Job Type"
              icon={Briefcase}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              options={jobTypes}
            />

            <div className="flex items-end space-x-3">
              <button
                onClick={applyFilters}
                className="group flex-1 bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Search Jobs</span>
                </span>
              </button>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="group px-4 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl hover:border-green-600 hover:text-green-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <X className="h-5 w-5 transition-transform group-hover:scale-110" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {filters.search && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm">
                    <Target className="h-4 w-4 mr-2" />
                    Search: {filters.search}
                    <button
                      onClick={() => clearSingleFilter('search')}
                      className="ml-3 hover:text-green-900 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location: {filters.location}
                    <button
                      onClick={() => clearSingleFilter('location')}
                      className="ml-3 hover:text-blue-900 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 shadow-sm">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Type: {filters.type}
                    <button
                      onClick={() => clearSingleFilter('type')}
                      className="ml-3 hover:text-purple-900 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-8 px-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <p className="text-xl text-gray-700">
                Found <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''}
                {filters.search && ` for "${filters.search}"`}
                {filters.location && ` in ${filters.location}`}
                {filters.type && ` • ${filters.type}`}
              </p>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg animate-pulse hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-14 w-14 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-7 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="group flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-600 hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span className="font-medium">Previous</span>
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-2">
                  {getVisiblePages().map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold min-w-[3rem] ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-2xl transform scale-105'
                          : 'bg-white/80 border border-gray-300 text-gray-700 hover:border-green-600 hover:bg-green-50 hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="group flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-600 hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="font-medium">Next</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </>
        ) : (
          // No Jobs Found State
          <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg">
                <Briefcase className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No jobs found</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                We couldn't find any jobs matching your criteria. Try adjusting your search terms or browse all available positions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={clearFilters}
                  className="group bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                >
                  <span className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span>Clear All Filters</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    setFilters({ search: '', location: '', type: '' });
                    setSearchParams({});
                  }}
                  className="group border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Browse All Jobs</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;