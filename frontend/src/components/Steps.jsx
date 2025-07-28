import React, { useState } from 'react';
import { steps } from '../assets/stepsdata';
import { ArrowRight, ArrowLeft, Sparkles, Star, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// Enhanced Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 6,
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

const sparkleAnimation = {
  scale: [1, 1.3, 1],
  rotate: [0, 180, 360],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 3,
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

function Step({ icon: Icon, title, description, stepNumber }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      variants={itemVariants}
      className="relative flex flex-col items-center group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
    >
      {/* Step number indicator */}
      <motion.div 
        className={`absolute -top-4 ${isRTL ? 'right-8' : 'left-4'} w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 
          rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10`}
        animate={pulseAnimation}
      >
        {stepNumber}
      </motion.div>

      {/* Floating sparkles */}
      <motion.div
        className="absolute -top-2 -right-2 text-yellow-400"
        animate={sparkleAnimation}
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>

      {/* Icon container with glassmorphism effect */}
      <motion.div 
        className="w-24 h-24 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm 
          rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/20 
          relative overflow-hidden group-hover:shadow-2xl transition-all duration-500"
        animate={isHovered ? glowAnimation : {}}
      >
        {/* Animated background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 
            group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            background: [
              "linear-gradient(45deg, #3B82F6, #6366F1, #8B5CF6)",
              "linear-gradient(45deg, #6366F1, #8B5CF6, #3B82F6)",
              "linear-gradient(45deg, #8B5CF6, #3B82F6, #6366F1)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Icon */}
        <Icon className="h-12 w-12 text-blue-600 group-hover:text-white relative z-10 
          transition-all duration-500 group-hover:scale-110" />
        
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 
            bg-gradient-to-r from-blue-400/30 to-indigo-400/30 blur-xl transition-opacity duration-500"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Content with enhanced typography */}
      <div className="text-center space-y-3 max-w-sm">
        <motion.h3 
          className="text-2xl bg-gradient-to-r from-gray-900 to-gray-700 
            bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 
            transition-all duration-300"
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
        >
          {t(title)}
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
          animate={isHovered ? { y: -2 } : { y: 0 }}
        >
          {t(description)}
        </motion.p>
      </div>
      
      {/* Interactive completion indicator */}
      <motion.div
        className="mt-6 p-3 bg-gradient-to-r from-green-100 to-emerald-100 
          rounded-full cursor-pointer group-hover:from-green-200 group-hover:to-emerald-200 
          transition-all duration-300 shadow-lg"
        whileHover={{ scale: 1.15, rotate: 360 }}
        whileTap={{ scale: 0.95 }}
      >
        <CheckCircle2 className="h-6 w-6 text-green-600" />
      </motion.div>

      {/* Progress indicator */}
      <motion.div 
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 
          bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 
          group-hover:opacity-100 transition-opacity duration-300"
        initial={{ width: 0 }}
        animate={isHovered ? { width: 64 } : { width: 0 }}
      />
    </motion.div>
  );
}

Step.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  stepNumber: PropTypes.number.isRequired,
};

export default function HowItWorks() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/30 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div 
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          {/* Badge */}
          <motion.span 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 
              text-blue-700 px-6 py-2 rounded-full text-sm font-semibold tracking-wide uppercase 
              shadow-lg border border-blue-200/50 backdrop-blur-sm"
            animate={pulseAnimation}
          >
            <Zap className="w-4 h-4" />
            {t('simple_process')}
            <Sparkles className="w-4 h-4" />
          </motion.span>
          
          {/* Main heading */}
          <motion.h2 
            className="text-5xl lg:text-6xl font-bold mt-6 mb-6"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              background: "linear-gradient(90deg, #1e293b, #3b82f6, #6366f1, #8b5cf6, #1e293b)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t('how_it_works')}
          </motion.h2>
          
          {/* Decorative line */}
          <motion.div 
            className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 
              mx-auto mb-8 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent"
              animate={{ x: [-100, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          {/* Description */}
          <motion.p 
            className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t('finding_your_perfect_property')}
            <span className="font-semibold text-blue-600">{t('three_step_process')}</span>
          </motion.p>
          
        </motion.div>

        {/* Enhanced Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-12 relative"
        >
          {/* Animated connection line - desktop */}
          <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-1 bg-gray-100 rounded-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 2, delay: 1 }}
            />
          </div>

          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                onHoverStart={() => setActiveStep(index)}
                onHoverEnd={() => setActiveStep(null)}
              >
                <Step
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  stepNumber={index + 1}
                />
              </motion.div>
              
              {/* Enhanced connection arrows - desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute" 
                  style={{ right: `${(index + 0.68) * (100 / 3) + 3}%`, top: '11%' }}>
                  <motion.div
                    animate={{
                      x: [0, 8, 0],
                      scale: activeStep === index ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      x: { duration: 2, ease: "easeInOut", repeat: Infinity },
                      scale: { duration: 0.3 }
                    }}
                    className={`transition-colors duration-300 ${
                      activeStep === index ? 'text-indigo-600' : 'text-blue-500'
                    }`}
                  >
                    {isRTL ? <ArrowLeft className="h-5 w-8" /> : <ArrowRight className="h-5 w-8" />}
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center mt-20"
        >
          {/* CTA button with enhanced styling */}
          <motion.a
            href="/properties"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r 
              from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl 
              shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 
              text-lg border border-blue-500/20"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 
                rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <span className="relative z-10">{t('start_your_journey')}</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isRTL ? <ArrowLeft className="w-5 h-5 relative z-10" /> : <ArrowRight className="w-5 h-5 relative z-10" />}
            </motion.div>
          </motion.a>
          
          {/* Additional info */}
          <motion.p 
            className="text-gray-500 text-sm mt-4 flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {t('no_registration_required')} • {t('free_to_sign_up')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}