import React from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Building2, Home, Target } from 'lucide-react';
import CountUp from './Contup';
import { useTranslation } from 'react-i18next';

const milestonesData = [
  {
    icon: Home,
    value: 5000,
    key: 'properties',
  },
  {
    icon: Target,
    value: 10000,
    key: 'clients',
  },
];

export default function Milestones() {
  const { t } = useTranslation();

  const milestones = milestonesData.map(milestone => ({
    ...milestone,
    title: t(`about.milestones.${milestone.key}.title`),
    description: t(`about.milestones.${milestone.key}.description`),
  }));

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('about.milestones.title')}</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('about.milestones.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <motion.div
                key={milestone.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-5xl font-bold text-blue-600 mb-4">
                  <CountUp from={0} to={milestone.value} duration={2} separator="," />
                </h3>
                <p className="text-2xl font-semibold mb-3">{milestone.title}</p>
                <p className="text-gray-600 text-lg">{milestone.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}