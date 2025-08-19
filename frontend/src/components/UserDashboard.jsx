import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Building, UserCheck, Settings, Heart, Loader, CalendarCheck2, Star } from 'lucide-react';
import { Backendurl } from '../App';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const roleIcons = {
  client: User,
  seller: Building,
  agent: UserCheck
};
const roleColors = {
  client: 'bg-blue-500',
  seller: 'bg-green-500',
  agent: 'bg-purple-500'
};

const sidebarLinks = [
  { to: '/dashboard/profile', label: 'dashboard.profile', icon: User },
  { to: '/dashboard/saved-properties', label: 'dashboard.saved_properties', icon: Heart },
  { to: '/dashboard/appointments', label: 'appointments', icon: CalendarCheck2 },
];

const UserDashboard = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ saved: 0, appointments: 0 });
  const location = useLocation();

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/users/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Saved properties
      const savedRes = await axios.get(`${Backendurl}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Appointments 
      let appointmentsCount = 0;
      try {
        const appRes = await axios.get(`${Backendurl}/api/appointments/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        appointmentsCount = appRes.data.appointments?.length || 0;
      } catch {}
      setStats({
        saved: savedRes.data.wishlist?.length || 0,
        appointments: appointmentsCount
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p className="text-gray-600">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex pt-32 pb-32 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      {/* Sidebar */}
      <aside className={`w-72 bg-white/90 shadow-xl p-8 flex flex-col gap-8 sticky top-0 h-[calc(100vh-4rem)] max-h-[900px] z-20 ${isRTL ? 'rounded-l-3xl' : 'rounded-r-3xl'} hidden md:flex`}>
        <div className="mb-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">{t('dashboard.title')}</motion.div>
          <div className="text-sm text-gray-500 mb-2">{t('dashboard.welcome')}, <span className="font-semibold text-blue-700">{userData.name}</span></div>
          <div className="flex gap-2 flex-wrap">
            {userData.roles.map(role => {
              const meta = roleColors[role] || 'bg-gray-400';
              return <span key={role} className={`px-2 py-1 rounded text-xs text-white font-semibold ${meta}`}>{t(`dashboard.role_${role}`)}</span>;
            })}
          </div>
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          {sidebarLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all duration-200
                ${location.pathname === link.to ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
            >
              <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                {link.icon && React.createElement(link.icon, { className: 'w-5 h-5' })}
              </motion.span>
              <span>{t(link.label)}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="text-xs text-gray-400">Aurora Real Estate</div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 w-full px-2 md:px-8 py-10">
        <AnimatePresence mode="wait">
          {location.pathname === '/dashboard' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-xl p-10 mb-10 flex flex-col gap-6"
            >
              <div className="text-2xl font-bold text-blue-700 mb-2">{t('dashboard.welcome_back', { name: userData.name })}</div>
              <div className="flex gap-8 flex-wrap">
                <div className="flex flex-col items-center">
                  <Save className="w-7 h-7 text-pink-500 mb-1" />
                  <div className="text-lg font-bold">{stats.saved}</div>
                  <div className="text-xs text-gray-500">{t('dashboard.saved_properties')}</div>
                </div>
                <div className="flex flex-col items-center">
                  <CalendarCheck2 className="w-7 h-7 text-green-500 mb-1" />
                  <div className="text-lg font-bold">{stats.appointments}</div>
                  <div className="text-xs text-gray-500">{t('dashboard.appointments')}</div>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="w-7 h-7 text-yellow-400 mb-1" />
                  <div className="text-lg font-bold">{userData.roles.length}</div>
                  <div className="text-xs text-gray-500">{t('dashboard.roles')}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard; 