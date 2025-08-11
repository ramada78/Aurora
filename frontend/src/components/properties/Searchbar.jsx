import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLastSearch as saveLastSearchAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ onSearch, className }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dropdownRef = useRef(null);

  // Popular locations suggestion  
  const popularLocations = i18n.language === 'ar' 
    ? ['حلب', 'دمشق', 'اللاذقية', 'حمص']
    : ['Aleppo', 'Damascus', 'Latakia', 'Homs'];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  const saveLastSearch = async (searchObj) => {
    const token = localStorage.getItem('token');
    if (token) {
      await saveLastSearchAPI(searchObj);
    } else {
      let arr = JSON.parse(localStorage.getItem('lastSearches') || '[]');
      arr = [searchObj, ...arr.filter(s => JSON.stringify(s) !== JSON.stringify(searchObj))].slice(0, 10);
      localStorage.setItem('lastSearches', JSON.stringify(arr));
    }
  };

  const parseSearchQuery = (query) => {
    // Basic parsing for demo: look for known city/type keywords in both languages
    const lower = query.toLowerCase();
    const cities = ['aleppo', 'damascus', 'latakia', 'homs', 'حلب', 'دمشق', 'اللاذقية', 'حمص'];
    const types = ['apartment', 'villa', 'house', 'flat', 'studio', 'شقة', 'فيلا', 'منزل', 'استوديو'];
    let city = cities.find(c => lower.includes(c.toLowerCase()));
    let propertyType = types.find(t => lower.includes(t.toLowerCase()));
    return {
      city: city ? city.charAt(0).toUpperCase() + city.slice(1) : '',
      propertyType: propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : '',
      searchQuery: query
    };
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;

    // Update recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Save last search for AI recommendations
    const parsed = parseSearchQuery(query);
    saveLastSearch(parsed.city || parsed.propertyType ? parsed : { searchQuery: query });
    
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder={t('search_by_title_city_property')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className={`w-full ${isRTL ? 'pr-12 pl-20' : 'pl-12 pr-20'} py-3 rounded-lg border border-gray-200 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
            transition-all text-gray-800 placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <Search 
          className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 
            text-gray-400 h-5 w-5`} 
        />
        
        <div className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 flex items-center gap-2`}>
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              type="button"
              onClick={clearSearch}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 
                hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg 
              hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {t('search')}
          </button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg 
              shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            {recentSearches.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-500 px-3 mb-2">
                  {t('recent_searches')}
                </h3>
                {recentSearches.map((query, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => {
                      setSearchQuery(query);
                      handleSearch(query);
                    }}
                    className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-3 py-2 hover:bg-gray-50 
                      rounded-md flex items-center gap-2 text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    {query}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 p-2">
              <h3 className="text-xs font-medium text-gray-500 px-3 mb-2">
                {t('popular_locations')}
              </h3>
              {popularLocations.map((location, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => {
                    setSearchQuery(location);
                    handleSearch(location);
                  }}
                  className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-3 py-2 hover:bg-gray-50 
                    rounded-md flex items-center gap-2 text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {location}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;