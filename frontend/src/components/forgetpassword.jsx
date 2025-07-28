import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader, Shield, CheckCircle, Sparkles, Key, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { Backendurl } from "../App";
import { useTranslation } from "react-i18next";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const floatingAnimation = {
  y: [-3, 3, -3],
  rotate: [-1, 1, -1],
  transition: {
    duration: 4,
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl}/api/users/forgot`, { email });
      if (response.data.success) {
        setIsSuccess(true);
        toast.success(t('forgotPassword.successMessage'));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error(t('forgotPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={floatingAnimation}
          className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200/50 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, y: floatingAnimation.y.map(y => -y), x: [-5, 5, -5] }}
          className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-200/50 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={pulseAnimation}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/30 rounded-full filter blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('forgotPassword.successTitle')}</h2>
                <p className="text-gray-600 mb-6">{t('forgotPassword.successSubtitle')}</p>
                <p className="text-gray-600 mb-6">{email}</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <Link to="/" className="inline-block mb-6 group">
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.div
                        animate={floatingAnimation}
                        className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25"
                      >
                        <Lock className="w-6 h-6 text-white" />
                      </motion.div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Aurora
                      </h1>
                    </motion.div>
                  </Link>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Key className="w-5 h-5 text-blue-500" />
                      <h2 className="text-2xl font-bold text-gray-800">{t('forgotPassword.title')}</h2>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t('forgotPassword.subtitle')}
                    </p>
                  </motion.div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>{t('forgotPassword.emailLabel')}</label>
                    <div className="relative">
                      <motion.input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        required
                        className={`w-full py-3 rounded-xl bg-gray-50/80 border-2 transition-all duration-300 placeholder-gray-400 focus:ring-4 focus:outline-none ${isRTL ? 'pr-12 text-right' : 'pl-12'} ${emailFocused ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20' : 'border-transparent'}`}
                        placeholder={t('forgotPassword.emailPlaceholder')}
                      />
                      <motion.div
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`}
                        animate={emailFocused ? { scale: 1.1, color: '#3B82F6' } : {}}
                      >
                        <Mail className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>{t('forgotPassword.sending')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>{t('forgotPassword.sendLink')}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6">
            <AnimatePresence>
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <motion.button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{t('forgotPassword.sendAnother')}</span>
                  </motion.button>
                  
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    {t('forgotPassword.returnToLogin')}
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
                  >
                    <motion.div
                      whileHover={{ x: isRTL ? 5 : -5 }}
                      className={isRTL ? 'ml-2' : 'mr-2'}
                    >
                      <ArrowLeft className={isRTL ? 'transform rotate-180' : ''} />
                    </motion.div>
                    <span className="group-hover:underline">{t('forgotPassword.backToLogin')}</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <Shield className="w-4 h-4 text-green-500" />
            <span className="font-medium">{t('forgotPassword.securityNote')}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;