import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Components
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";

// Pages
import Login from "./components/login";
import Dashboard from "./pages/Dashboard";
import List from "./pages/List";
import Add from "./pages/Add";
import Update from "./pages/Update";
import Appointments from "./pages/Appointments";

import Amenities from './pages/Amenities';
import Cities from './pages/Cities';
import PropertyTypes from './pages/PropertyTypes';
import Reviews from './pages/Reviews';
import Transactions from './pages/Transactions';
import UsersPage from './pages/Users';
import News from './pages/News';
import Forms from './pages/Forms';

// Config
export const backendurl = import.meta.env.VITE_BACKEND_URL;

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document direction based on current language
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/list" element={<Layout><List /></Layout>} />
                <Route path="/add" element={<Layout><Add /></Layout>} />
                <Route path="/update/:id" element={<Layout><Update /></Layout>} />
                <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
        
                <Route path="/amenities" element={<Layout><Amenities /></Layout>} />
                <Route path="/cities" element={<Layout><Cities /></Layout>} />
                <Route path="/property-types" element={<Layout><PropertyTypes /></Layout>} />
                <Route path="/reviews" element={<Layout><Reviews /></Layout>} />
                <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
                <Route path="/users" element={<Layout><UsersPage /></Layout>} />
                <Route path="/news" element={<Layout><News /></Layout>} />
                <Route path="/forms" element={<Layout><Forms /></Layout>} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;