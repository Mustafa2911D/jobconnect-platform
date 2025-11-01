import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Phone, Mail, Star, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { name: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Top Companies', path: '/companies' },
    { name: 'Career Advice', path: '/career-advice' },
    { name: 'Salary Guide', path: '/salary-guide' },
    { name: 'About Us', path: '/about' }
  ];
  
  const jobCategories = [
    'IT & Tech', 'Finance', 'Healthcare', 'Engineering',
    'Education', 'Sales', 'Hospitality', 'Construction'
  ];

  const popularCities = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria'
  ];

  return (
    <footer className="relative bg-gradient-to-r from-green-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">JobConnect</h2>
                <p className="text-white/80 text-sm">South Africa</p>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Connecting talent with opportunity across South Africa
            </p>
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <Heart className="h-4 w-4 text-red-400" />
              <span>Proudly South African</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-white/70 hover:text-white transition-colors text-sm flex items-center space-x-2"
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Job Categories */}
          <div>
            <h3 className="font-semibold mb-4">Job Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {jobCategories.map((category, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>

          {/* Contact & Locations */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Phone className="h-4 w-4" />
                <span>+27 11 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Mail className="h-4 w-4" />
                <span>info@jobconnect.co.za</span>
              </div>
            </div>
            
            <h4 className="font-semibold mt-6 mb-3">Popular Cities</h4>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((city, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-white/20 rounded-lg text-xs text-white/80"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-white/60 text-sm">
              © {currentYear} JobConnect SA. All rights reserved.
            </div>
            <div className="flex space-x-4 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;