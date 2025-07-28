import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader, 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  Sparkles, 
  Key,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { Backendurl } from "../App";
import { useTranslation } from "react-i18next";

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

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return t('resetPassword.strength.weak');
      case 2:
        return t('resetPassword.strength.fair');
      case 3:
        return t('resetPassword.strength.good');
      case 4:
      case 5:
        return t('resetPassword.strength.strong');
      default:
        return "";
    }
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const isFormValid = password.length >= 8 && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error(t('resetPassword.validation.formInvalid'));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl}/api/users/reset/${token}`, { password });
      if (response.data.success) {
        setIsSuccess(true);
        toast.success(t('resetPassword.successMessage'));
        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error(response.data.message || t('resetPassword.errorMessage'));
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(t('resetPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen font-sans flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"
        />
        <motion.div 
          animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 1}}}
          className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-30"
        />
        <motion.div 
          animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 2}}}
          className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-25"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12" />
          
          {/* Success State */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center z-20"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h3>
                <p className="text-gray-600">Redirecting to login...</p>
              </div>
            </motion.div>
          )}

          {/* Logo & Title */}
          <motion.div variants={inputVariants} className="text-center mb-8 relative">
            <Link to="/" className="inline-block mb-6 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <motion.div
                  animate={sparkleAnimation}
                  className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400"
                >
                  <Sparkles className="w-full h-full" />
                </motion.div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Aurora
                </h2>
              </motion.div>
            </Link>
            
            <motion.div
              animate={pulseAnimation}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25"
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('resetPassword.title')}</h2>
            <p className="text-gray-600">{t('resetPassword.subtitle')}</p>
          </motion.div>

          <motion.form 
            variants={inputVariants}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            {/* New Password Field */}
            <motion.div variants={inputVariants}>
              <label 
                htmlFor="password" 
                className={`flex items-center justify-between mb-2 text-sm font-medium text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {t('resetPassword.newPasswordLabel')}
                {password && (
                  <span className="text-xs font-semibold" style={{ color: getPasswordStrengthColor().replace('bg-', '') }}>
                    {getPasswordStrengthText()}
                  </span>
                )}
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className={`w-full py-3 rounded-xl bg-gray-50/80 border-2 transition-all duration-300 placeholder-gray-400 focus:ring-4 focus:outline-none ${isRTL ? 'pr-12 text-right' : 'pl-12'} ${passwordFocused ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20' : 'border-transparent'}`}
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                />
                <motion.div
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                  animate={passwordFocused ? { scale: 1.1, color: '#3B82F6' } : {}}
                >
                  <Lock className="w-5 h-5" />
                </motion.div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1 rounded-full transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <motion.div
                  className={`h-1 rounded-full ${getPasswordStrengthColor()}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${passwordStrength * 20}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={inputVariants}>
              <label htmlFor="confirm-password" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('resetPassword.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <motion.input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  required
                  className={`w-full py-3 rounded-xl bg-gray-50/80 border-2 transition-all duration-300 placeholder-gray-400 focus:ring-4 focus:outline-none ${isRTL ? 'pr-12 text-right' : 'pl-12'} ${confirmPasswordFocused ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20' : 'border-transparent'}`}
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                />
                <motion.div
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                  animate={confirmPasswordFocused ? { scale: 1.1, color: '#3B82F6' } : {}}
                >
                  <Lock className="w-5 h-5" />
                </motion.div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1 rounded-full transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 flex items-center space-x-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">{t('resetPassword.passwordsMatch')}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">{t('resetPassword.passwordsDontMatch')}</span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.button
              variants={inputVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl ${
                isFormValid && !loading
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-6 h-6" />
                </motion.div>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>{t('resetPassword.buttonText')}</span>
                </>
              )}
            </motion.button>

            <motion.div
              variants={inputVariants}
              className="text-center"
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 transition-colors group"
              >
                <motion.div
                  whileHover={{ x: isRTL ? 5 : -5 }}
                  className={isRTL ? 'ml-2' : 'mr-2'}
                >
                  <ArrowLeft className={isRTL ? 'transform rotate-180' : ''} />
                </motion.div>
                <span className="group-hover:underline">{t('resetPassword.backToLogin')}</span>
              </Link>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;