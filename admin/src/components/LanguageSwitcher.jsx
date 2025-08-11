import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Update document direction for RTL support
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const currentLanguage = i18n.language;

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        onClick={() => {
          const newLang = currentLanguage === 'en' ? 'ar' : 'en';
          changeLanguage(newLang);
        }}
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage === 'en' ? 'English' : 'العربية'}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher; 