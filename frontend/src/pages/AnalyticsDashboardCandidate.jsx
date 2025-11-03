import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsAPI } from '../api/apiClient.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart,
  Legend, RadialBarChart, RadialBar
} from 'recharts';
import {
  TrendingUp, Users, Eye, DollarSign, Clock, Target, Award,
  Download, Filter, Calendar, Zap, Star, TrendingDown,
  Briefcase, CheckCircle, FileText, MapPin, RefreshCw,
  Menu, X, Bell, MessageCircle, ArrowUpRight, ArrowDownRight,
  Sparkles, Lightbulb, Rocket, Crown, Shield, Activity,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

// Constants
const performanceMetrics = [
  {
    label: 'Response Rate',
    value: '68%',
    change: '+12%',
    trend: 'up',
    description: 'Employers responding',
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    label: 'Interview Rate',
    value: '42%',
    change: '+8%',
    trend: 'up',
    description: 'Applications to interviews',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    label: 'Offer Rate',
    value: '25%',
    change: '+5%',
    trend: 'up',
    description: 'Interviews to offers',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }
];

const chartTypes = [
  { key: 'applications', label: 'Applications', icon: BarChart3 },
  { key: 'status', label: 'Status', icon: PieChartIcon },
  { key: 'skills', label: 'Skills', icon: LineChartIcon }
];

// Helper Functions
const getApplicationStatusData = (analytics) => {
  if (!analytics?.applicationStats) return [];

  const { applicationStats } = analytics;
  
  const statusData = [
    { 
      name: 'Pending', 
      value: applicationStats.pending || 0, 
      color: '#F59E0B',
      gradient: 'from-yellow-400 to-amber-500',
      icon: Clock,
      count: applicationStats.pending || 0
    },
    { 
      name: 'Reviewed', 
      value: applicationStats.reviewed || 0, 
      color: '#3B82F6',
      gradient: 'from-blue-400 to-cyan-500',
      icon: Eye,
      count: applicationStats.reviewed || 0
    },
    { 
      name: 'Accepted', 
      value: applicationStats.accepted || 0, 
      color: '#10B981',
      gradient: 'from-green-400 to-emerald-500',
      icon: CheckCircle,
      count: applicationStats.accepted || 0
    },
    { 
      name: 'Rejected', 
      value: applicationStats.rejected || 0, 
      color: '#EF4444',
      gradient: 'from-red-400 to-rose-500',
      icon: X,
      count: applicationStats.rejected || 0
    }
  ].filter(item => item.value > 0);

  return statusData;
};

const getEnhancedTrendData = (analytics) => {
  if (analytics?.applicationTrends && analytics.applicationTrends.length > 0) {
    return analytics.applicationTrends;
  }
  
  // Fallback mock data 
  return [
    { date: 'Jan', applications: 12, interviews: 3, offers: 1 },
    { date: 'Feb', applications: 18, interviews: 5, offers: 2 },
    { date: 'Mar', applications: 15, interviews: 4, offers: 1 },
    { date: 'Apr', applications: 22, interviews: 7, offers: 3 },
    { date: 'May', applications: 25, interviews: 8, offers: 4 },
    { date: 'Jun', applications: 30, interviews: 10, offers: 5 }
  ];
};

const getEnhancedSkillsData = (analytics) => {
  if (analytics?.skillsInDemand && analytics.skillsInDemand.length > 0) {
    return analytics.skillsInDemand;
  }
  
  return [
    { skill: 'React', demand: 85, avgSalary: 55000, match: 92 },
    { skill: 'Node.js', demand: 78, avgSalary: 60000, match: 88 },
    { skill: 'Python', demand: 82, avgSalary: 58000, match: 85 },
    { skill: 'AWS', demand: 75, avgSalary: 65000, match: 78 },
    { skill: 'TypeScript', demand: 80, avgSalary: 57000, match: 90 }
  ];
};

// Main Component
const AnalyticsDashboardCandidate = () => {
  // Hooks and State
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeChart, setActiveChart] = useState('applications');

  // Effects
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // API Functions
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching candidate analytics...');
      
      const response = await analyticsAPI.getCandidateAnalytics();
      console.log('Analytics API response:', response.data);
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
        console.log('Analytics data set:', response.data.analytics);
        console.log('Application Stats:', response.data.analytics.applicationStats);
      } else {
        console.error('Analytics API returned error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Event Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleChartChange = (chartKey) => {
    setActiveChart(chartKey);
  };

  // Data Processing
  const applicationStatusData = getApplicationStatusData(analytics);
  const trendData = getEnhancedTrendData(analytics);
  const skillsData = getEnhancedSkillsData(analytics);
  const totalApplications = analytics?.totalApplications || 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your career analytics...</p>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderHeader = () => {
    return (
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Career Analytics
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Real-time insights for your job search in South Africa
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-green-600" />
              <span>Live data tracking</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Private & secure</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Rocket className="h-4 w-4 text-purple-600" />
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <select
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white w-full lg:w-40 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderKeyMetrics = () => {
    const metrics = [
      {
        label: 'Total Applications',
        value: analytics?.totalApplications || 0,
        trend: '+12 this week',
        icon: FileText,
        gradient: 'from-blue-500 to-cyan-500',
        trendColor: 'text-green-600'
      },
      {
        label: 'Success Rate',
        value: `${analytics?.successRate || 0}%`,
        trend: 'Above average',
        icon: TrendingUp,
        gradient: 'from-green-500 to-emerald-500',
        trendColor: 'text-green-600'
      },
      {
        label: 'Profile Views',
        value: analytics?.profileViews || 0,
        trend: '+8 this month',
        icon: Users,
        gradient: 'from-purple-500 to-violet-500',
        trendColor: 'text-blue-600'
      },
      {
        label: 'Quality Matches',
        value: analytics?.jobMatches || 0,
        trend: '85%+ relevance',
        icon: Briefcase,
        gradient: 'from-orange-500 to-red-500',
        trendColor: 'text-orange-600'
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
                  {metric.value}
                </p>
                <div className={`flex items-center text-sm ${metric.trendColor} mt-2`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{metric.trend}</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPerformanceMetrics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-semibold ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{metric.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{metric.label}</div>
            <div className="text-xs text-gray-500">{metric.description}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderChartNavigation = () => {
    return (
      <div className="flex items-center space-x-2 mb-6 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm w-fit">
        {chartTypes.map((chart) => (
          <button
            key={chart.key}
            onClick={() => handleChartChange(chart.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeChart === chart.key
                ? 'bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <chart.icon className="h-4 w-4" />
            <span>{chart.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderApplicationsTrend = () => {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Applications & Interviews Trend</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Applications</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Interviews</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="applications" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Applications"
              />
              <Line 
                type="monotone" 
                dataKey="interviews" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Interviews"
              />
              <Line 
                type="monotone" 
                dataKey="offers" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                name="Offers"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderApplicationStatus = () => {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Application Status
          </h3>
          {totalApplications > 0 && (
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {totalApplications} total
            </span>
          )}
        </div>
        
        {applicationStatusData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const percentage = totalApplications > 0 ? ((value / totalApplications) * 100).toFixed(1) : 0;
                      return [
                        <div key="tooltip" className="text-center">
                          <div className="font-semibold">{value} applications</div>
                          <div className="text-sm text-gray-600">({percentage}%)</div>
                        </div>,
                        name
                      ];
                    }}
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Status Legend */}
            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
              {applicationStatusData.map((status, index) => {
                const percentage = totalApplications > 0 ? ((status.value / totalApplications) * 100).toFixed(1) : 0;
                const StatusIcon = status.icon;
                return (
                  <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${status.gradient} shadow-sm`}></div>
                      <StatusIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{status.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 block">{status.value}</span>
                      <span className="text-xs text-gray-500">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">No applications yet</p>
            <p className="text-sm text-center mb-4">Start applying to see your status distribution</p>
            <button className="bg-gradient-to-r from-green-600 to-blue-800 text-white px-4 py-2 rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300">
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSkillsInDemand = () => {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Skills in Demand & Salary Trends</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Demand %</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Avg Salary (R)</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="skill" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'demand') return [`${value}%`, 'Market Demand'];
                  if (name === 'avgSalary') return [`R ${value.toLocaleString()}`, 'Avg Salary'];
                  if (name === 'match') return [`${value}%`, 'Your Match'];
                  return [value, name];
                }}
                contentStyle={{ 
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="demand" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Market Demand"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avgSalary" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Avg Salary (R)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderInsightsAndRecommendations = () => {
    const insightsData = [
      { label: 'Total Applications', value: analytics?.totalApplications || 0, trend: '+12 this week' },
      { label: 'Success Rate', value: `${analytics?.successRate || 0}%`, trend: 'Above average' },
      { label: 'Profile Views', value: analytics?.profileViews || 0, trend: '+8 this month' },
      { label: 'Interview Conversion', value: '42%', trend: '+8% improvement' },
      { label: 'Avg Response Time', value: '2.8 days', trend: 'Faster than avg' }
    ];

    const recommendations = [
      {
        title: "Enhance Your Skills",
        description: "Based on market demand, consider learning TypeScript and AWS to increase your job matches by 35%",
        icon: Target,
        color: "bg-blue-100 text-blue-600"
      },
      {
        title: "Optimize Your Profile",
        description: "Complete your profile with portfolio projects to get 50% more employer views",
        icon: Star,
        color: "bg-green-100 text-green-600"
      },
      {
        title: "Network Strategy",
        description: "Connect with 5 recruiters this week in your target companies for better opportunities",
        icon: Users,
        color: "bg-purple-100 text-purple-600"
      }
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-gradient-to-br from-green-600 to-blue-800 text-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-xl font-bold mb-6 flex items-center space-x-3">
            <Zap className="h-6 w-6 text-yellow-300" />
            <span>Performance Insights</span>
          </h3>
          <div className="space-y-4">
            {insightsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/20 last:border-0">
                <span className="font-medium">{item.label}</span>
                <div className="text-right">
                  <div className="font-bold text-lg">{item.value}</div>
                  <div className="text-sm text-green-200">{item.trend}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-yellow-200 mb-2">
              <Lightbulb className="h-4 w-4" />
              <span className="font-semibold">Pro Tip</span>
            </div>
            <p className="text-sm">Your applications with personalized cover letters have 3x higher response rates.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Rocket className="h-6 w-6 text-purple-600" />
            <span>Career Recommendations</span>
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                <div className={`w-10 h-10 ${rec.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <rec.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderHeader()}
        {renderKeyMetrics()}
        {renderPerformanceMetrics()}
        {renderChartNavigation()}

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {renderApplicationsTrend()}
          {renderApplicationStatus()}
        </div>

        {renderSkillsInDemand()}
        {renderInsightsAndRecommendations()}
      </div>
    </div>
  );
};

export default AnalyticsDashboardCandidate;