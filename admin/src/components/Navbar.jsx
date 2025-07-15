import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  List, 
  PlusSquare, 
  Calendar, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Database,
  ChevronDown,
  Settings,
  Building,
  MapPin,
  Tag,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMetaDataOpen, setIsMetaDataOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('roles');
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/list', label: 'Properties', icon: List },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/transactions', label: 'Transactions', icon: TrendingUp },
    { path: '/users', label: 'Users', icon: Users },
  ];

  const metaDataItems = [
    { path: "/amenities", label: "Amenities", icon: Settings },
    { path: "/cities", label: "Cities", icon: MapPin },
    { path: "/property-types", label: "Property Types", icon: Building },
    { path: "/reviews", label: "Reviews", icon: Star },
  ];

  // Role-based navigation logic
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Main admin sees all
  let filteredNavItems = navItems;
  let filteredMetaDataItems = metaDataItems;
  if (!isAdmin) {
    if (roles.includes('agent')) {
      // Agent: Properties, Appointments, Transactions, Meta Data (no Reviews)
      filteredNavItems = navItems.filter(item =>
        ['/list', '/appointments', '/transactions'].includes(item.path)
      );
      filteredMetaDataItems = metaDataItems.filter(item => item.path !== '/reviews');
    } else if (roles.includes('seller')) {
      // Seller: only Properties
      filteredNavItems = navItems.filter(item => item.path === '/list');
      filteredMetaDataItems = [];
    }
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </div>
              </Link>
            ))}
            
            {/* Meta Data Dropdown (hide for seller) */}
            {filteredMetaDataItems.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsMetaDataOpen(!isMetaDataOpen)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filteredMetaDataItems.some(item => location.pathname === item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Database className="h-4 w-4 mr-1.5" />
                  <span>Meta Data</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMetaDataOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMetaDataOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {filteredMetaDataItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                          location.pathname === item.path
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMetaDataOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-1.5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ml-2"
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </div>
            </button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-100 shadow-lg"
        >
          <div className="px-2 pt-2 pb-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </div>
              </Link>
            ))}
            
            {/* Meta Data Dropdown (hide for seller) */}
            {filteredMetaDataItems.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsMetaDataOpen(!isMetaDataOpen);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    filteredMetaDataItems.some(item => location.pathname === item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    <span>Meta Data</span>
                  </div>
                </button>

                {isMetaDataOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {filteredMetaDataItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          location.pathname === item.path
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMetaDataOpen(false)}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-2" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;