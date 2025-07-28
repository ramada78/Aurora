import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './components/properties/propertydetail';
import Aboutus from './pages/About'
import Contact from './pages/Contact'
import Login from './components/login';
import Signup from './components/signup';
import ForgotPassword from './components/forgetpassword';
import ResetPassword from './components/resetpassword';
import Footer from './components/footer';
import NotFoundPage from './components/Notfound';
import { AuthProvider } from './context/AuthContext';
import AIPropertyHub from './pages/Aiagent'
import StructuredData from './components/SEO/StructuredData';
import 'react-toastify/dist/ReactToastify.css';
import UserDashboard from './components/UserDashboard';
import UserProfile from './pages/UserProfile';
import SavedProperties from './pages/SavedProperties';
import Appointments from './pages/Appointments';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Backendurl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const App = () => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <HelmetProvider>
    <AuthProvider>
    <Router>
      {/* Language Switcher */}
      <div style={{ textAlign: 'right', padding: '0.5rem 1rem' }}>
        <button onClick={() => handleLanguageChange('ar')} disabled={i18n.language === 'ar'}>
          {t('arabic')}
        </button>
        <span style={{ margin: '0 0.5rem' }}>|</span>
        <button onClick={() => handleLanguageChange('en')} disabled={i18n.language === 'en'}>
          {t('english')}
        </button>
      </div>
      {/* Base website structured data */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<UserDashboard />}>
          <Route path="profile" element={<UserProfile />} />
          <Route path="saved-properties" element={<SavedProperties />} />
          <Route path="appointments" element={<Appointments />} />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/single/:id" element={<PropertyDetails />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-property-hub" element={<AIPropertyHub />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <ToastContainer />
    </Router>
    </AuthProvider>
    </HelmetProvider>
  )
}

export default App