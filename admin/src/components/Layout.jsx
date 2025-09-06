import React from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';

const Layout = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex-1 pt-20 px-4 pb-8 ${className}`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
