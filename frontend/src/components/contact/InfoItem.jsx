import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ContactInfoItem({ icon: Icon, title, content, link }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const ContentWrapper = link ? 'a' : 'div';
  const props = link ? { href: link } : {};

  return (
    <ContentWrapper
      {...props}
      className={`flex items-start ${link ? 'hover:text-blue-600 transition-colors' : ''}`}
    >
      <div className={`p-3 rounded-xl bg-blue-100 text-blue-600 text-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="font-bold text-gray-800">{title}</div>
        <div className="text-gray-600 text-sm">{content}</div>
      </div>
    </ContentWrapper>
  );
}