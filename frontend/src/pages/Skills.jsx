import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../api/apiClient.js';
import { 
  Plus, X, Star, Save, Camera, MapPin, User, Briefcase, Award, 
  BookOpen, Settings, Zap, Rocket, TrendingUp, Target, CheckCircle,
  ChevronRight, Sparkles, Lightbulb, Crown, Shield, Globe,
  Code, Palette, Database, Cloud, Server, Smartphone, Cpu,
  Search, Filter, Award as AwardIcon, Brain, Heart
} from 'lucide-react';

const Skills = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState('technical');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Constants
  const skillCategories = [
    { id: 'all', name: 'All Skills', icon: Globe, color: 'bg-gray-500' },
    { id: 'technical', name: 'Technical', icon: Code, color: 'bg-blue-500' },
    { id: 'design', name: 'Design', icon: Palette, color: 'bg-purple-500' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'soft', name: 'Soft Skills', icon: Heart, color: 'bg-pink-500' },
    { id: 'language', name: 'Languages', icon: Globe, color: 'bg-yellow-500' }
  ];

  const popularSkills = {
    technical: [
      'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS',
      'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git', 'REST APIs',
      'GraphQL', 'Next.js', 'Vue.js', 'Angular', 'Java', 'C#', 'PHP'
    ],
    design: [
      'Figma', 'Adobe XD', 'Sketch', 'UI/UX Design', 'Wireframing',
      'Prototyping', 'User Research', 'Design Systems', 'Adobe Creative Suite'
    ],
    business: [
      'Project Management', 'Agile Methodology', 'Scrum', 'Product Management',
      'Business Analysis', 'Strategic Planning', 'Data Analysis', 'Excel'
    ],
    soft: [
      'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
      'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity'
    ],
    language: [
      'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'French',
      'German', 'Portuguese', 'Spanish'
    ]
  };

  const navigationItems = [
    { key: 'profile', label: 'Profile Overview', icon: User, href: '/profile' },
    { key: 'experience', label: 'Work Experience', icon: Briefcase, href: '/experience' },
    { key: 'education', label: 'Education', icon: Award, href: '/education' },
    { key: 'skills', label: 'Skills & Expertise', icon: BookOpen, active: true },
    { key: 'settings', label: 'Account Settings', icon: Settings, href: '/settings' },
  ];

  const skillTips = [
    { icon: Target, text: 'Focus on skills relevant to your target roles', color: 'text-green-600' },
    { icon: TrendingUp, text: 'Be honest about your skill levels', color: 'text-blue-600' },
    { icon: AwardIcon, text: 'Highlight your expert-level skills', color: 'text-yellow-600' },
    { icon: Brain, text: 'Include both technical and soft skills', color: 'text-purple-600' }
  ];

  // Effects
  useEffect(() => {
    fetchSkills();
  }, []);

  // API Functions
  const fetchSkills = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      
      let formattedSkills = [];
      
      if (userData.skills && Array.isArray(userData.skills)) {
        if (userData.skills.length > 0 && typeof userData.skills[0] === 'string') {
          formattedSkills = userData.skills
            .filter(skill => skill && skill.trim())
            .map(skill => ({
              name: skill.trim(),
              level: 'intermediate',
              category: 'technical'
            }));
          
          if (formattedSkills.length > 0) {
            await saveSkills(formattedSkills);
          }
        } else {
          formattedSkills = userData.skills
            .filter(skill => skill && skill.name && skill.name.trim())
            .map(skill => ({
              name: skill.name.trim(),
              level: skill.level || 'intermediate',
              category: skill.category || 'technical'
            }));
        }
      }
      
      setSkills(formattedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      showToast('Error loading skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSkills = async (updatedSkills) => {
    try {
      setSaving(true);
      
      const formattedSkills = updatedSkills.map(skill => ({
        name: skill.name,
        level: skill.level || 'intermediate',
        category: skill.category || 'technical'
      }));

      console.log('Saving skills:', formattedSkills);
      
      const response = await userAPI.updateProfile({ skills: formattedSkills });
      
      if (response.data.success) {
        setSkills(updatedSkills);
        updateUser(response.data.user);
        showToast('Skills updated successfully! 🚀');
        return true;
      }
    } catch (error) {
      console.error('Error saving skills:', error);
      const errorMessage = error.response?.data?.message || 'Error saving skills';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Utility Functions
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('uploads/')) return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/profile-images/${imagePath}`;
  };

  const showToast = (message, type = 'success') => {
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 ${
      type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'
    } text-white px-6 py-4 rounded-2xl shadow-2xl z-50 transform transition-all duration-500 translate-x-0 flex items-center space-x-3`;
    
    toast.innerHTML = `
      ${type === 'success' ? 
        '<div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle class="h-4 w-4 text-white" /></div>' :
        '<div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><X class="h-4 w-4 text-white" /></div>'
      }
      <span class="font-semibold">${message}</span>
    `;
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 500);
    }, 4000);
  };

  const getSkillLevelStars = (level) => {
    const stars = [];
    const filledStars = level === 'beginner' ? 1 : level === 'intermediate' ? 3 : 5;
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < filledStars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'from-green-500 to-emerald-500',
      intermediate: 'from-yellow-500 to-amber-500',
      expert: 'from-red-500 to-rose-500'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  const getCategoryColor = (category) => {
    const categoryObj = skillCategories.find(cat => cat.id === category);
    return categoryObj ? categoryObj.color : 'bg-gray-500';
  };

  const getSkillStats = () => {
    const total = skills.length;
    const expert = skills.filter(s => s.level === 'expert').length;
    const intermediate = skills.filter(s => s.level === 'intermediate').length;
    const beginner = skills.filter(s => s.level === 'beginner').length;
    
    return { total, expert, intermediate, beginner };
  };

  const getFilteredSkills = () => {
    let filtered = skills;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Event Handlers
  const addSkill = async () => {
    if (newSkill.trim()) {
      const skillExists = skills.some(skill => 
        skill.name.toLowerCase() === newSkill.trim().toLowerCase()
      );
      
      if (skillExists) {
        showToast('Skill already exists!', 'error');
        return;
      }

      const newSkillObj = {
        name: newSkill.trim(),
        level: newSkillLevel,
        category: newSkillCategory
      };

      const updatedSkills = [...skills, newSkillObj];
      const success = await saveSkills(updatedSkills);
      
      if (success) {
        setNewSkill('');
        setNewSkillLevel('intermediate');
      }
    }
  };

  const removeSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill.name !== skillToRemove.name);
    await saveSkills(updatedSkills);
  };

  const updateSkillLevel = async (skillName, newLevel) => {
    const updatedSkills = skills.map(skill => 
      skill.name === skillName ? { ...skill, level: newLevel } : skill
    );
    await saveSkills(updatedSkills);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your skills...</p>
        </div>
      </div>
    );
  }

  const skillStats = getSkillStats();
  const filteredSkills = getFilteredSkills();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Profile Card */}
              <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                      {getImageUrl(user?.profileImage || user?.profile?.avatar) ? (
                        <img 
                          src={getImageUrl(user?.profileImage || user?.profile?.avatar)} 
                          alt="Profile" 
                          className="w-full h-full rounded-2xl object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full rounded-2xl flex items-center justify-center ${getImageUrl(user?.profileImage || user?.profile?.avatar) ? 'hidden' : 'flex'}`}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 text-sm capitalize mb-2">{user?.role}</p>
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{user?.profile?.location?.province || 'South Africa'}</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    item.href ? (
                      <Link
                        key={item.key}
                        to={item.href}
                        className="group flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-green-600/10 hover:to-blue-800/10 hover:text-green-600 hover:shadow-md"
                      >
                        <item.icon className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 ml-auto transition-all duration-300 group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <div
                        key={item.key}
                        className="group flex items-center space-x-3 px-4 py-3 text-left rounded-xl bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-lg"
                      >
                        <item.icon className="h-5 w-5 text-white" />
                        <span className="font-medium">{item.label}</span>
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )
                  ))}
                </nav>
              </div>

              {/* Skills Stats */}
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Skills Overview</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total Skills</span>
                    <span className="font-bold text-blue-600">{skillStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Expert Level</span>
                    <span className="font-bold text-red-600">{skillStats.expert}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Intermediate</span>
                    <span className="font-bold text-yellow-600">{skillStats.intermediate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Beginner</span>
                    <span className="font-bold text-green-600">{skillStats.beginner}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
                  Skills & Expertise
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Showcase your professional skills and expertise to South African employers
                </p>
              </div>
            </div>

            {/* Add Skill Form */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <Rocket className="h-6 w-6 text-green-600" />
                <span>Add New Skill</span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Skill Name *</label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="input-field transition-all duration-300 group-hover:border-gray-300"
                    placeholder="e.g., React, Project Management, Python"
                    disabled={saving}
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Skill Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="input-field transition-all duration-300 group-hover:border-gray-300"
                    disabled={saving}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="input-field transition-all duration-300 group-hover:border-gray-300"
                    disabled={saving}
                  >
                    {skillCategories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={addSkill}
                  disabled={saving || !newSkill.trim()}
                  className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{saving ? 'Adding Skill...' : 'Add Skill'}</span>
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="Search skills..."
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {skillCategories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills Grid */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Your Skills ({filteredSkills.length})</h3>
                <span className="text-sm text-gray-500">
                  Showing {filteredSkills.length} of {skills.length} skills
                </span>
              </div>

              {filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSkills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="group p-6 border border-gray-200 rounded-2xl hover:border-green-600/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 ${getCategoryColor(skill.category)} rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                            <span className="font-bold text-sm">
                              {skill.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {skill.name}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(skill.category)} text-white`}>
                                {skillCategories.find(cat => cat.id === skill.category)?.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="flex items-center space-x-1">
                                {getSkillLevelStars(skill.level)}
                              </div>
                              <select
                                value={skill.level}
                                onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                                disabled={saving}
                                className="text-sm border-none bg-transparent p-0 focus:ring-0 focus:outline-none text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="expert">Expert</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeSkill(skill)}
                          disabled={saving}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-600/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/delete ml-2"
                          title="Remove skill"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // No Skills Found State
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Target className="h-10 w-10 text-gray-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">No Skills Found</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter to see more skills.' 
                      : 'Start building your skills profile by adding your first skill!'
                    }
                  </p>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="bg-gradient-to-r from-green-600 to-blue-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Skill Suggestions */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <span>Popular Skills in South Africa</span>
              </h3>
              
              <div className="space-y-6">
                {skillCategories.filter(cat => cat.id !== 'all').map(category => {
                  const IconComponent = category.icon;
                  return (
                    <div key={category.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <IconComponent className="h-5 w-5" />
                        <span>{category.name} Skills</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {popularSkills[category.id]?.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => {
                              setNewSkill(skill);
                              setNewSkillCategory(category.id);
                            }}
                            disabled={saving || skills.some(s => s.name.toLowerCase() === skill.toLowerCase())}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                              skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-blue-800 text-white hover:from-blue-800 hover:to-green-600 hover:shadow-lg'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips Section */}
            <div className="card p-6 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Skill Building Tips</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {skillTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <tip.icon className={`h-4 w-4 ${tip.color} mt-0.5 flex-shrink-0`} />
                    <span className="text-gray-700">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;