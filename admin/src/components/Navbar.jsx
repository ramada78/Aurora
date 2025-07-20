import React, { useState, useEffect, useRef } from 'react';
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
  BellIcon,
  Star,
  TrendingUp,
  Users,
  MessageCircle,
  Bell,
} from 'lucide-react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMetaDataOpen, setIsMetaDataOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);
  
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

  // Fetch notifications
  const fetchNotifications = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setNotifLoading(true);
      axios.get('/api/users/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setNotifications(res.data.notifications || []))
        .catch(() => setNotifications([]))
        .finally(() => setNotifLoading(false));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time updates - poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Mark notifications as read
  const markAllRead = () => {
    const token = localStorage.getItem('token');
    axios.put('/api/users/notifications/read', {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    });
  };

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Clear all notifications
  const clearAllNotifications = () => {
    const token = localStorage.getItem('token');
    axios.delete('/api/users/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setNotifications([]);
      setNotifDropdownOpen(false);
    }).catch((error) => {
      console.error("Error clearing notifications:", error);
    });
  };

  // Handle click outside of notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    if (notifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifDropdownOpen]);

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
          <nav className="hidden md:flex space-x-1 items-center">
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

            {/* Enhanced Notification Bell Dropdown */}
            <div className="relative ml-4" ref={notifRef}>
              <button
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              >
                <BellIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </button>
              
              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BellIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-gray-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={fetchNotifications}
                            className="text-xs text-gray-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-gray-100"
                            title="Refresh notifications"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 mt-2 text-sm">Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No notifications yet</p>
                          <p className="text-gray-400 text-xs mt-1">We'll notify you when something happens</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notif, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`group relative px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                                !notif.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              {/* Unread indicator */}
                              {!notif.read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600"></div>
                              )}
                              
                              <div className="flex items-start space-x-3">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  notif.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                                  notif.type === 'system' ? 'bg-gray-100 text-gray-600' :
                                  notif.type === 'message' ? 'bg-green-100 text-green-600' :
                                  'bg-purple-100 text-purple-600'
                                }`}>
                                  {notif.type === 'appointment' && <Calendar className="w-4 h-4" />}
                                  {notif.type === 'system' && <Settings className="w-4 h-4" />}
                                  {notif.type === 'message' && <MessageCircle className="w-4 h-4" />}
                                  {notif.type === 'other' && <Bell className="w-4 h-4" />}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">
                                      {new Date(notif.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {notif.link && (
                                      <Link 
                                        to={notif.link}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                        onClick={() => setNotifDropdownOpen(false)}
                                      >
                                        View →
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    {false && notifications.length > 0 && (
                      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                        <button 
                          onClick={clearAllNotifications}
                          className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                        >
                          Clear all notifications →
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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