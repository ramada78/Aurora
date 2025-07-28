import { useState } from 'react';
import { 
  Home, 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  Mail, 
  Send, 
  MapPin, 
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Heart,
  Star,
  Zap,
  Clock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Backendurl } from '../App';
import PropTypes from 'prop-types';
import Client from '../../../backend/models/Client';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/logo.png';

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
};

const floatingAnimation = {
  y: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const glowAnimation = {
  boxShadow: [
    "0 0 20px rgba(59, 130, 246, 0.3)",
    "0 0 40px rgba(59, 130, 246, 0.5)",
    "0 0 20px rgba(59, 130, 246, 0.3)"
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Mobile Collapsible Footer Section
const MobileFooterSection = ({ title, children, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h3 className="text-base font-bold text-gray-800">
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Footer Column Component
const FooterColumn = ({ title, children, className = '', delay = 0, icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`${className} group`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-6">
          {Icon && (
            <motion.div 
              className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"
              animate={floatingAnimation}
            >
              <Icon className="w-4 h-4 text-white" />
            </motion.div>
          )}
          <h3 className="text-lg font-bold text-gray-800">
            {title}
          </h3>
        </div>
      )}
      {children}
    </motion.div>
  );
};

// Footer Link Component
const FooterLink = ({ href, children, icon: Icon }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.dir() === 'rtl';
  return (
    <motion.a 
      href={href} 
      className="group flex items-center text-gray-600 transition-all duration-300 hover:text-blue-600 hover:translate-x-2 py-2 relative overflow-hidden"
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      <div className="relative z-10 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-3 text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />}
        {isRTL ? <ChevronLeft className="w-3 h-3 ml-2 mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" /> 
        : <ChevronRight className="w-3 h-3 mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" />}
        <span className="font-medium">{children}</span>
      </div>
    </motion.a>
  );
};

// Newsletter Component
const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('footer.enter_email'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl || 'http://localhost:4000'}/news/newsdata`, { email });
      if (response.status === 200) {
        toast.success(t('footer.subscribe_success'));
        setEmail('');
      } else {
        toast.error(t('footer.subscribe_fail'));
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error(t('footer.subscribe_fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute top-2 right-2">
        <motion.div animate={glowAnimation}>
          <Sparkles className="w-6 h-6 text-blue-400" />
        </motion.div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"
          animate={floatingAnimation}
        >
          <Mail className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800">{t('footer.stay_updated')}</h3>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        {t('footer.newsletter_desc')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            name="email"
            id="newsletter-email-footer"
            placeholder={t('footer.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 pr-4 py-4 w-full text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-70 font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('footer.subscribing')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              <span>{t('footer.subscribe_now')}</span>
              <Zap className="w-4 h-4" />
            </div>
          )}
        </motion.button>
      </form>

      <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
        <Shield className="w-3 h-3" />
        {t('footer.privacy_agreement')} <a href="#" className="underline hover:text-blue-600 transition-colors">{t('footer.privacy_policy')}</a>.
      </p>
    </motion.div>
  );
};

// Main Footer Component
const companyLinks = [
  { name: 'footer.home', href: '/', icon: Home },
  { name: 'footer.properties', href: '/properties', icon: MapPin },
  { name: 'footer.about_us', href: '/about', icon: Star },
  { name: 'footer.contact', href: '/contact', icon: Mail },
  { name: 'footer.ai_property_hub', href: '/ai-agent', icon: Zap },
];

const teamMembers = [
  { name: 'footer.rama_dadeekhi', href: '/', icon: Sparkles },
  { name: 'footer.seba_ismail', href: '/', icon: Sparkles },
  { name: 'footer.mohannad_tarakji', href: '/', icon: Sparkles },
  { name: 'footer.mahmoud_alsaied', href: '/', icon: Sparkles },
];

const contactInfo = [
  { 
    icon: MapPin, 
    text: 'footer.aleppo_university',
    href: 'https:#' 
  },
  { 
    icon: Mail, 
    text: 'footer.marwa_dahdouh',
    href: 'mailto:#' 
  },
];

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.dir() === 'rtl';
  return (
    <footer className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      
      {/* Main Footer */}
      <div className="relative pt-16 lg:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand section */}
          <motion.div 
            className="text-center lg:text-left mb-16"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <motion.div 
                className="p-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg"
                animate={glowAnimation}
              >
                <img src={logo} alt="Aurora logo" className="w-10 h-10 brightness-0 invert" />
              </motion.div>
              <div className={`${isRTL ? 'mr-4 text-right' : 'ml-4'}`}>
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  {t('navbar.aurora')}
                </span>
                <p className="text-sm text-gray-500 font-medium">{t('navbar.future_real_estate')}</p>
              </div>
            </div>
            
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {t('footer.brand_desc')}
            </motion.p>
          </motion.div>

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-12 gap-8 mb-12">
            {/* Quick Links Column */}
            <FooterColumn 
              title={t('footer.quick_links')} 
              className="col-span-3" 
              delay={0.2}
              icon={Home}
            >
              <ul className="space-y-3">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {t(link.name)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Help Column */}
            <FooterColumn 
              title={t('footer.team_members')} 
              className="col-span-3" 
              delay={0.3}
              icon={Heart}
            >
              <ul className="space-y-3">
                {teamMembers.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {t(link.name)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Contact Info */}
            <FooterColumn 
              title={t('footer.credits')} 
              className="col-span-3" 
              delay={0.4}
              icon={MapPin}
            >
              <ul className="space-y-4">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <motion.a 
                      href={item.href} 
                      className="group flex items-start text-gray-600 hover:text-blue-600 transition-all duration-300 p-3 rounded-xl hover:bg-blue-50"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`p-2 bg-blue-100 rounded-lg ${isRTL ? 'ml-4' : 'mr-4'} group-hover:bg-blue-200 transition-colors duration-300`}>
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{t(item.text)}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            
            {/* Newsletter */}
            <div className="col-span-3">
              <Newsletter />
            </div>
          </div>

          {/* Mobile Accordions */}
          <motion.div 
            className="lg:hidden space-y-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <MobileFooterSection title={t('footer.quick_links')} icon={Home}>
              <ul className="space-y-2">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {t(link.name)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title={t('footer.support')} icon={Heart}>
              <ul className="space-y-2">
                {teamMembers.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {t(link.name)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title={t('footer.contact_us')} icon={MapPin}>
              <ul className="space-y-3">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <motion.a 
                      href={item.href} 
                      className="flex items-start text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-blue-500" />
                      <span className="text-sm">{t(item.text)}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <div className="pt-6">
              <Newsletter />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 border-t border-gray-700/50">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.p 
              className="text-sm text-gray-300 text-center md:text-left flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-gray-400">{t('footer.made_with_love')}</span>
            </motion.p>
            
            <motion.a
              href="/properties"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              {t('footer.explore_properties')}
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </motion.a>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      />
    </footer>
  );
};

Footer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.elementType
};

MobileFooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

FooterColumn.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  icon: PropTypes.elementType
};

FooterLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

export default Footer;