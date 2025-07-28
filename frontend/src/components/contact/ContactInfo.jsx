import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactInfoItem from './InfoItem';
import { useTranslation } from 'react-i18next';

const contactInfo = [
  {
    icon: Phone,
    title: 'phone',
    content: 'contact_phone',
    link: 'tel:+963234567890',
  },
  {
    icon: Mail,
    title: 'email',
    content: 'contact_email',
    link: 'mailto:support@Aurora.com',
  },
  {
    icon: MapPin,
    title: 'address',
    content: 'contact_address',
    link: '#map',
  },
  {
    icon: Clock,
    title: 'working_hours',
    content: 'contact_working_hours',
  },
];

export default function ContactInfo() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-2xl shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-8">{t('our_office')}</h2>
      <div className="space-y-6">
        {contactInfo.map((info, index) => (
          <ContactInfoItem key={index} {...info} title={t(info.title)} content={t(info.content)} />
        ))}
      </div>
    </motion.div>
  );
}