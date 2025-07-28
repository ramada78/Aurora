import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = ({ title: defaultTitle = "AI Property Assistant" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const title = defaultTitle === "AI Property Assistant" ? t('aiAgent.header.title') : defaultTitle;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-4 sm:px-6 shadow-lg relative z-50"
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Title */}
        <Link to="/ai-property-hub" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <motion.div
            whileHover={{ rotate: isRTL ? -10 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <Brain className="w-6 h-6 sm:w-7 sm:h-7" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block"
          >
            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              {title}
            </h1>
          </motion.div>
        </Link>

        {/* Mobile Title (centered) */}
        <div className="sm:hidden absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-lg font-bold text-white">
            {title.split(' ').slice(0, 2).join(' ')}
          </h1>
        </div>

        {/* Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('aiAgent.header.backToHome')}</span>
          </motion.button>
          <Link
            to="/properties"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            {t('aiAgent.header.browseProperties')}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="p-2 rounded-full text-white hover:bg-white/20 focus:outline-none transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-indigo-700 shadow-lg overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBack}
                className={`flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors w-full ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('aiAgent.header.backToHome')}</span>
              </motion.button>
              
              <Link 
                to="/properties" 
                onClick={() => setIsMenuOpen(false)}
                className="text-center px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                {t('aiAgent.header.browseProperties')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
};

export default Header;