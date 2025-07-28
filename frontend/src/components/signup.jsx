import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Shield, 
  Star,
  ArrowRight,
  ArrowLeft,
  User,
  Key,
  Home,
  Phone
} from 'lucide-react';
import { Backendurl } from '../App';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const floatingAnimation = {
  y: [-3, 3, -3],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const sparkleAnimation = {
  scale: [1, 1.2, 1],
  rotate: [0, 180, 360],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { 
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roles: ['client'], // Default to client
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({
    name: false,
    email: false,
    password: false,
    phone: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Available roles
  const availableRoles = [
    { value: 'client', label: t('signup.roles.client.label'), description: t('signup.roles.client.description') },
    { value: 'seller', label: t('signup.roles.seller.label'), description: t('signup.roles.seller.description') },
    { value: 'agent', label: t('signup.roles.agent.label'), description: t('signup.roles.agent.description') }
  ];

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  // Real-time validation
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) error = t('signup.validation.nameRequired');
        break;
      case 'email':
        if (!value) error = t('signup.validation.emailRequired');
        else if (!/\S+@\S+\.\S+/.test(value)) error = t('signup.validation.emailInvalid');
        break;
      case 'password':
        if (!value) error = t('signup.validation.passwordRequired');
        else if (value.length < 8) error = t('signup.validation.passwordLength');
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = t('signup.validation.passwordsMismatch');
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      if (formData.confirmPassword) {
        validateField('confirmPassword', formData.confirmPassword);
      }
    }
  };

  const handleFocus = (field) => {
    setFieldFocus(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFieldFocus(prev => ({ ...prev, [field]: false }));
    validateField(field, formData[field]);
  };

  const handleRoleChange = (role) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || formData.roles.length === 0) {
      if(formData.roles.length === 0) toast.error(t('signup.validation.roleRequired'));
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${Backendurl}/api/users/signup`,
        formData
      );
      if (response.data.success) {
        toast.success(t('signup.success'));
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(t('signup.error'));
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return 'bg-green-500';
    if (passwordStrength >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`relative min-h-screen font-sans ${isRTL ? 'font-[Tajawal]' : ''} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10">
        <motion.div 
          animate={floatingAnimation}
          className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-200 rounded-full opacity-30 filter blur-xl" 
        />
        <motion.div 
          animate={{ ...floatingAnimation, y: floatingAnimation.y.map(y => y * -1) }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-200 rounded-full opacity-30 filter blur-xl" 
        />
        <motion.div
          animate={sparkleAnimation}
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-200 rounded-full opacity-20 filter blur-2xl"
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md"
        >
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20"
          >
            {/* Logo & Title */}
            <motion.div
              variants={inputVariants}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-block mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
                >
                  <motion.div
                    animate={pulseAnimation}
                    className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center"
                  >
                    <Home className="w-6 h-6 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Aurora
                  </h1>
                </motion.div>
              </Link>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">{t('signup.title')}</h2>
                <p className="text-gray-600">{t('signup.subtitle')}</p>
                
                {/* Stats */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className={`w-4 h-4 text-yellow-500 fill-current ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span>{t('signup.rating')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className={`w-4 h-4 text-green-500 ${isRTL ? 'mr-6 ml-2' : 'mr-2'}`} />
                    <span>{t('signup.secure')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className={`w-4 h-4 text-blue-500 ${isRTL ? 'ml-2' : 'mr-2'}`}/>
                    <span>{t('signup.users')}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div variants={inputVariants}>
                <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-[Tajawal]' : ''}`}>
                  {t('signup.nameLabel')}
                </label>
                <div className="relative group">
                  <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    fieldFocus.name ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right font-[Tajawal]' : 'pl-10 pr-4'} py-3 rounded-xl bg-gray-50/50 border-2 transition-all duration-200 placeholder-gray-400 ${
                      validationErrors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : fieldFocus.name
                        ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:ring-4 focus:outline-none`}
                    placeholder={t('signup.namePlaceholder')}
                  />
                  {validationErrors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}
                    >
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-1 text-sm text-red-600 ${isRTL ? 'text-right' : ''}`}
                    >
                      {validationErrors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={inputVariants}>
                <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-[Tajawal]' : ''}`}>
                  {t('signup.emailLabel')}
                </label>
                <div className="relative group">
                  <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    fieldFocus.email ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right font-[Tajawal]' : 'pl-10 pr-4'} py-3 rounded-xl bg-gray-50/50 border-2 transition-all duration-200 placeholder-gray-400 ${
                      validationErrors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : fieldFocus.email
                        ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:ring-4 focus:outline-none`}
                    placeholder={t('signup.emailPlaceholder')}
                  />
                  {validationErrors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}
                    >
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-1 text-sm text-red-600 ${isRTL ? 'text-right' : ''}`}
                    >
                      {validationErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Phone Field */}
              <motion.div variants={inputVariants}>
                <label htmlFor="phone" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-[Tajawal]' : ''}`}>
                  {t('signup.phoneLabel')}
                </label>
                <div className="relative group">
                  <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    fieldFocus.phone ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right font-[Tajawal]' : 'pl-10 pr-4'} py-3 rounded-xl bg-gray-50/50 border-2 transition-all duration-200 placeholder-gray-400 ${
                      validationErrors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : fieldFocus.phone
                        ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:ring-4 focus:outline-none`}
                    placeholder={t('signup.phonePlaceholder')}
                  />
                </div>
                <AnimatePresence>
                  {validationErrors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {validationErrors.phone}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={inputVariants}>
                <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right font-[Tajawal]' : ''}`}>
                  {t('signup.passwordLabel')}
                </label>
                <div className="relative group">
                  <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    fieldFocus.password ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <Key className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    className={`w-full ${isRTL ? 'pr-10 pl-10 text-right font-[Tajawal]' : 'pl-10 pr-10'} py-3 rounded-xl bg-gray-50/50 border-2 transition-all duration-200 placeholder-gray-400 ${
                      validationErrors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : fieldFocus.password
                        ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:ring-4 focus:outline-none`}
                    placeholder={t('signup.passwordPlaceholder')}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                </div>
                
                {/* Password Strength Indicator */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-gray-600">{t('signup.passwordStrength.label')}:</span>
                        <span className={`text-sm font-medium ${
                          passwordStrength < 50 ? 'text-red-500' : 
                          passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength < 50 ? t('signup.passwordStrength.weak') : 
                           passwordStrength < 75 ? t('signup.passwordStrength.medium') : t('signup.passwordStrength.strong')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-2 rounded-full transition-colors duration-300 ${
                            passwordStrength < 50 ? 'bg-red-500' : 
                            passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {validationErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-1 text-sm text-red-600 ${isRTL ? 'text-right' : ''}`}
                    >
                      {validationErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Role Selection */}
              <motion.div variants={inputVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">{t('signup.selectRole')}</h3>
                <p className="text-sm text-gray-600">{t('signup.roleDescription')}</p>
                <div className="grid grid-cols-1 gap-4">
                  {availableRoles.map(role => (
                    <motion.div
                      key={role.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRoleChange(role.value)}
                        className={`w-full ${isRTL ? 'text-right' : 'text-left'} p-4 rounded-xl border-2 transition-all duration-200 flex items-center ${
                          formData.roles.includes(role.value)
                            ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isRTL ? 'ml-4' : 'mr-4'} flex-shrink-0 ${
                          formData.roles.includes(role.value)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.roles.includes(role.value) && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{role.label}</p>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>{t('signup.creatingAccount')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className={`w-5 h-5 ${isRTL? 'ml-2' : ''}`} />
                    <span>{t('signup.createAccount')}</span>
                  </>
                )}
              </motion.button>
              
              {/* Features section */}
              <motion.div variants={inputVariants} className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">{t('signup.featureSecure')}</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">{t('signup.featureVerified')}</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">{t('signup.featurePremium')}</p>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div variants={inputVariants} className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">{t('signup.alreadyHaveAccount')}</span>
                </div>
              </motion.div>

              {/* Sign In Link */}
              <motion.div variants={inputVariants}>
                                  <Link
                    to="/login"
                    className="group w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                  >
                    <span className="group-hover:mr-2 transition-all duration-200">{t('signup.signInToAccount')}</span>
                    {isRTL ? <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 mr-1" /> : <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1" />}
                  </Link>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;