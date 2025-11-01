import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { analyticsAPI } from '../../api/apiClient.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import {
  TrendingUp, Users, Eye, DollarSign, Clock, Target, Award,
  Download, Filter, Calendar, Zap, Star, TrendingDown,
  Briefcase, CheckCircle, FileText, MapPin, RefreshCw,
  AlertCircle, Menu, X, Sparkles, ArrowUpRight, Activity,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  
  // State Management
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);

  // Constants
  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];
  
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days', icon: Calendar },
    { value: '30d', label: 'Last 30 days', icon: TrendingUp },
    { value: '90d', label: 'Last 90 days', icon: BarChart3 },
    { value: '1y', label: 'Last year', icon: Activity }
  ];

  // Data Processing Functions
  const getApplicationStatusData = () => {
    if (!analytics?.applicationStats) return [];

    const { applicationStats } = analytics;
    
    const statusData = [
      { 
        name: 'Pending', 
        value: applicationStats.pending || 0, 
        color: '#F59E0B',
        count: applicationStats.pending || 0,
        icon: Clock
      },
      { 
        name: 'Reviewed', 
        value: applicationStats.reviewed || 0, 
        color: '#3B82F6',
        count: applicationStats.reviewed || 0,
        icon: Eye
      },
      { 
        name: 'Accepted', 
        value: applicationStats.accepted || 0, 
        color: '#10B981',
        count: applicationStats.accepted || 0,
        icon: CheckCircle
      },
      { 
        name: 'Rejected', 
        value: applicationStats.rejected || 0, 
        color: '#EF4444',
        count: applicationStats.rejected || 0,
        icon: X
      }
    ].filter(item => item.value > 0);

    return statusData;
  };

  // API Functions
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching employer analytics...');
      
      const response = await analyticsAPI.getEmployerAnalytics();
      console.log('📊 Analytics API response:', response.data);
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
        console.log('✅ Analytics data loaded successfully');
      } else {
        console.error('❌ Analytics API returned error:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Effects
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Derived Data
  const applicationStatusData = getApplicationStatusData();
  const totalApplications = analytics?.overview?.totalApplications || 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your analytics...</p>
          <p className="text-gray-500 text-sm mt-2">Crunching the numbers</p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25"></div>
              <div className="relative">
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="relative border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white/80 backdrop-blur-sm w-full lg:w-auto transition-all duration-300"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full lg:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            {analytics ? `📊 Tracking ${analytics.overview?.totalApplications || 0} applications across ${analytics.overview?.totalJobs || 0} jobs` : 'Real-time hiring analytics and insights'}
          </p>
        </div>

        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Applications',
              value: analytics?.overview?.totalApplications || 0,
              subtitle: 'Live tracking',
              icon: Users,
              color: 'from-blue-500 to-cyan-600',
              trend: 'up',
              change: '+12%'
            },
            {
              label: 'Conversion Rate',
              value: `${analytics?.overview?.overallConversionRate || 0}%`,
              subtitle: 'Based on real data',
              icon: TrendingUp,
              color: 'from-green-500 to-emerald-600',
              trend: analytics?.overview?.overallConversionRate >= 15 ? 'up' : 'down',
              change: analytics?.overview?.overallConversionRate >= 15 ? '+5%' : '-2%'
            },
            {
              label: 'Active Jobs',
              value: analytics?.overview?.activeJobs || 0,
              subtitle: 'Currently live',
              icon: Briefcase,
              color: 'from-purple-500 to-indigo-600',
              trend: 'up',
              change: '+3'
            },
            {
              label: 'Avg Response Time',
              value: `${analytics?.overview?.avgResponseTime || 0}d`,
              subtitle: 'To first response',
              icon: Clock,
              color: 'from-orange-500 to-red-600',
              trend: analytics?.overview?.avgResponseTime <= 2 ? 'down' : 'up',
              change: analytics?.overview?.avgResponseTime <= 2 ? '-1d' : '+2d'
            }
          ].map((metric, index) => (
            <div 
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredMetric(index)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
              <div className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform ${
                hoveredMetric === index ? '-translate-y-2' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.label}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-xs text-gray-500">• {metric.subtitle}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center transform ${
                    hoveredMetric === index ? 'scale-110 rotate-12' : ''
                  } transition-transform duration-300 shadow-lg`}>
                    <metric.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Conversion Trends Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <LineChartIcon className="h-5 w-5 text-white" />
                </div>
                <span>Conversion Trends</span>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Performance over time</span>
              </div>
            </div>
            {analytics?.conversionTrends && analytics.conversionTrends.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.conversionTrends}>
                    <defs>
                      <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: '#6B7280' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                        return [value, name];
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fill="url(#conversionGradient)" 
                      name="Conversion Rate"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#1D4ED8' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <TrendingUp className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">No conversion data yet</p>
                <p className="text-gray-600 text-center max-w-sm">
                  Conversion trends will appear as you receive more applications and make hiring decisions
                </p>
              </div>
            )}
          </div>

          {/* Application Status Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <PieChartIcon className="h-5 w-5 text-white" />
                </div>
                <span>
                  Application Status
                  {totalApplications > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({totalApplications} total)
                    </span>
                  )}
                </span>
              </h3>
            </div>
            
            {applicationStatusData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="h-64 w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => {
                          const percentage = totalApplications > 0 ? ((value / totalApplications) * 100).toFixed(0) : 0;
                          return `${name}\n${value}`;
                        }}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const percentage = totalApplications > 0 ? ((value / totalApplications) * 100).toFixed(1) : 0;
                          return [`${value} applications (${percentage}%)`, name];
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Status Legend */}
                <div className="w-full lg:w-1/2 space-y-3">
                  {applicationStatusData.map((status, index) => {
                    const StatusIcon = status.icon;
                    const percentage = totalApplications > 0 ? ((status.value / totalApplications) * 100).toFixed(1) : 0;
                    return (
                      <div 
                        key={status.name} 
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm transform group-hover:scale-125 transition-transform duration-300" 
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <StatusIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">{status.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900 block">{status.value}</span>
                          <span className="text-sm text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">No applications yet</p>
                <p className="text-gray-600 text-center max-w-sm">
                  Applications will appear here as candidates apply to your job postings
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Job Performance Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span>Job Performance Analytics</span>
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Views vs Applications</span>
            </div>
          </div>
          {analytics?.popularJobs && analytics.popularJobs.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={analytics.popularJobs}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="title" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    fontSize={11}
                    interval={0}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis yAxisId="left" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'views') return [value, 'Views'];
                      if (name === 'applications') return [value, 'Applications'];
                      if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="views" fill="url(#viewsGradient)" radius={[4, 4, 0, 0]} name="Views" />
                  <Bar yAxisId="left" dataKey="applications" fill="url(#applicationsGradient)" radius={[4, 4, 0, 0]} name="Applications" />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} name="Conversion Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No job performance data</p>
              <p className="text-gray-600 text-center max-w-sm">
                Performance metrics will appear as your jobs receive views and applications from candidates
              </p>
            </div>
          )}
        </div>

        {/* Insights & Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Insights */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-green-600 to-blue-700 text-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <h3 className="text-xl font-bold mb-6 flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span>Performance Insights</span>
              </h3>
              <ul className="space-y-4">
                {[
                  { label: 'Total job postings', value: analytics?.overview?.totalJobs || 0, icon: Briefcase },
                  { label: 'Applications received', value: analytics?.overview?.totalApplications || 0, icon: Users },
                  { label: 'Overall conversion rate', value: `${analytics?.overview?.overallConversionRate || 0}%`, icon: TrendingUp },
                  { label: 'Average response time', value: `${analytics?.overview?.avgResponseTime || 0} days`, icon: Clock },
                  ...(analytics?.performanceMetrics ? [
                    { label: 'Application response rate', value: `${analytics.performanceMetrics.applicationResponseRate}%`, icon: Target },
                    { label: 'Candidate satisfaction', value: `${analytics.performanceMetrics.candidateSatisfaction}%`, icon: Award }
                  ] : [])
                ].map((item, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group/item">
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4 text-white/80" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold text-lg bg-white/20 px-3 py-1 rounded-lg group-hover/item:bg-white/30 transition-colors duration-300">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Optimization Recommendations */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span>Optimization Recommendations</span>
            </h3>
            <div className="space-y-4">
              {analytics?.recommendations && analytics.recommendations.length > 0 ? (
                analytics.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 group-hover:text-green-700 transition-colors duration-300">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-green-700 mt-1">{rec.description}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                ))
              ) : (
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">Get Started with Analytics</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Post your first job and start receiving applications to unlock personalized recommendations and insights.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;