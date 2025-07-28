import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Search, Home, MapPin, IndianRupee, Building } from 'lucide-react';
import { getPropertyTypes, getCities } from '../../services/api';
import { useTranslation } from 'react-i18next';

const SearchForm = ({ onSearch, isLoading }) => {
  const [searchParams, setSearchParams] = useState({
    city: '',
    maxPrice: 3,
    propertyCategory: 'Residential',
    propertyType: ''
  });
  const [activeField, setActiveField] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    getPropertyTypes().then(setPropertyTypes);
    getCities().then(setCities);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: name === 'maxPrice' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleCitySelect = (city) => {
    setSearchParams(prev => ({
      ...prev,
      city
    }));
    setActiveField(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100"
    >
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className={`p-2 bg-blue-100 rounded-lg ${isRTL ? 'sm:ml-3' : 'sm:mr-3'} w-10 h-10 flex items-center justify-center`}>
          <Search className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('aiAgent.searchForm.title')}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* City Field with Suggestions */}
        <div className="relative">
          <label htmlFor="city" className={`flex items-center text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <MapPin className={`w-4 h-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'} text-blue-600`} />
            {t('aiAgent.searchForm.city')}
          </label>
          <div className="relative">
            <input
              type="text"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={handleChange}
              onFocus={() => setActiveField('city')}
              onBlur={() => setTimeout(() => setActiveField(null), 100)}
              placeholder={t('aiAgent.searchForm.cityPlaceholder')}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
              required
            />
            {activeField === 'city' && cities.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2"
              >
                <p className={`px-3 py-1 text-xs font-medium text-gray-500 ${isRTL ? 'text-right' : ''}`}>{t('aiAgent.searchForm.syrianCities')}</p>
                <div className="mt-1 max-h-48 overflow-y-auto">
                  {cities.map((city) => (
                    <div
                      key={city._id}
                      onClick={() => handleCitySelect(city.city_name)}
                      className={`px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 flex items-center ${isRTL ? 'flex-row-reverse justify-between' : ''}`}
                    >
                      <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-400`} />
                      {city.city_name}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Price Field */}
          <div>
            <label htmlFor="maxPrice" className={`flex items-center text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <IndianRupee className={`w-4 h-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'} text-blue-600`} />
              {t('aiAgent.searchForm.maxPrice')}
            </label>
            <div className="relative">
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                min="0.5"
                max="50"
                step="0.1"
                value={searchParams.maxPrice}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                required
              />
              <span className={`absolute ${isRTL ? 'left-3 sm:left-4' : 'right-3 sm:right-4'} top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium`}>
                {t('aiAgent.searchForm.priceUnit')}
              </span>
            </div>
          </div>
          
          {/* Property Type Field */}
          <div>
            <label htmlFor="propertyType" className={`flex items-center text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Home className={`w-4 h-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'} text-blue-600`} />
              {t('aiAgent.searchForm.propertyType')}
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow appearance-none text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
            >
              <option value="">{t('aiAgent.searchForm.allTypes')}</option>
              {propertyTypes.map((type) => (
                <option key={type._id} value={type.type_name}>{isRTL ? type.type_name_ar : type.type_name}</option>
              ))}
            </select>
          </div>
          
          {/* Property Category Field */}
          <div>
            <label htmlFor="propertyCategory" className={`flex items-center text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Building className={`w-4 h-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'} text-blue-600`} />
              {t('aiAgent.searchForm.propertyCategory')}
            </label>
            <select
              id="propertyCategory"
              name="propertyCategory"
              value={searchParams.propertyCategory}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow appearance-none text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
            >
              <option value="Residential">{t('aiAgent.searchForm.residential')}</option>
              <option value="Commercial">{t('aiAgent.searchForm.commercial')}</option>
              <option value="Land">{t('aiAgent.searchForm.land')}</option>
              <option value="Industrial">{t('aiAgent.searchForm.industrial')}</option>
            </select>
          </div>

          {/* Price Range Selector */}
          <div className="sm:col-span-2">
            <label htmlFor="priceRange" className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <IndianRupee className="w-4 h-4 mr-1.5 text-blue-600" />
              Price Range
            </label>
            <input
              type="range"
              id="priceRange"
              name="maxPrice"
              min="0.5"
              max="50"
              step="0.1"
              value={searchParams.maxPrice}
              onChange={(e) => handleChange({ target: { name: 'maxPrice', value: e.target.value }})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5 Cr</span>
              <span>{searchParams.maxPrice} Cr</span>
              <span>50 Cr</span>
            </div>
          </div>
        </div>
        
        <motion.button 
          type="submit" 
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.03 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 sm:py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm sm:text-base">{t('aiAgent.searchForm.searching')}</span>
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">{t('aiAgent.searchForm.findProperties')}</span>
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default SearchForm;