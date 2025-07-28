import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Mission() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('about.purpose.title')}</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`flex items-center mb-6 ${isRTL ? '' : ''}`}>
              <Target className={`w-8 h-8 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <h2 className="text-2xl font-bold">{t('about.purpose.missionTitle')}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t('about.purpose.missionText')}
            </p>
          </motion.div>

          <motion.div
            initial={{ x: isRTL ? -20 : 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`flex items-center mb-6 ${isRTL ? '' : ''}`}>
              <Eye className={`w-8 h-8 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <h2 className="text-2xl font-bold">{t('about.purpose.visionTitle')}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t('about.purpose.visionText')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}