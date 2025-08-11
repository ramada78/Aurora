// Utility functions for internationalization
import i18n from '../i18n';

/**
 * Safely extracts localized text from translation objects
 * @param {string|object} textObj - The text object with language keys or a simple string
 * @returns {string} - The localized text for the current language
 */
export const getLocalizedText = (textObj) => {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;
  if (typeof textObj === 'object') {
    const currentLang = i18n.language;
    return textObj[currentLang] || textObj.en || textObj.ar || '';
  }
  return '';
};

/**
 * Gets the current language direction (LTR or RTL)
 * @returns {string} - 'rtl' or 'ltr'
 */
export const getCurrentDirection = () => {
  return i18n.dir();
};

/**
 * Checks if the current language is RTL
 * @returns {boolean} - true if RTL, false if LTR
 */
export const isRTL = () => {
  return i18n.dir() === 'rtl';
};
