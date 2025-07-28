import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, ArrowUp, DollarSign, BarChart3, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LocationTrends = ({ locations }) => {
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  // Process the location data to handle null values and format percentages
  const processedLocations = locations?.map(location => ({
    ...location,
    price_per_sqft: location.price_per_sqft || 0,
    percent_increase: location.percent_increase != null ? location.percent_increase : 0,
    rental_yield: location.rental_yield != null ? location.rental_yield : 0
  })) || [];
  
  if (!processedLocations || !Array.isArray(processedLocations) || processedLocations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center"
      >
        <div className="flex flex-col items-center justify-center py-8 sm:py-10">
          <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-3 sm:mb-4" />
          <p className="text-gray-500">{t('aiAgent.locationTrends.noData')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('aiAgent.locationTrends.tryDifferentCity')}</p>
        </div>
      </motion.div>
    );
  }

  // Find best investment opportunities from valid data only
  const validRentalYields = processedLocations.filter(loc => loc.rental_yield > 0);
  const validAppreciations = processedLocations.filter(loc => loc.percent_increase > 0);
  
  const bestRentalYield = validRentalYields.length > 0 
    ? validRentalYields.sort((a, b) => b.rental_yield - a.rental_yield)[0] 
    : processedLocations[0];
    
  const bestAppreciation = validAppreciations.length > 0
    ? validAppreciations.sort((a, b) => b.percent_increase - a.percent_increase)[0]
    : processedLocations[0];

  // Format display values
  const formatValue = (value, suffix = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return `${value}${suffix}`;
    return `${value}${suffix}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white p-4 sm:p-6 rounded-lg shadow-md ${isRTL ? 'text-right' : ''}`}
    >
      {/* Header - Stacked on mobile, side by side on larger screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`p-2 bg-blue-100 rounded-lg ${isRTL ? 'ml-3' : 'mr-3'}`}>
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{t('aiAgent.locationTrends.title')}</h2>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1 self-start sm:self-center">
          <button 
            className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'table' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('table')}
          >
            <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <BarChart3 className="w-4 h-4" /> {t('aiAgent.locationTrends.table')}
            </span>
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md transition-all ${activeTab === 'insights' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('insights')}
          >
            <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingUp className="w-4 h-4" /> {t('aiAgent.locationTrends.insights')}
            </span>
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('aiAgent.locationTrends.location')}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('aiAgent.locationTrends.pricePerSqft')}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('aiAgent.locationTrends.appreciation')}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('aiAgent.locationTrends.rentalYield')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedLocations.map((loc, index) => (
                    <motion.tr
                      key={loc.location}
                      onHoverStart={() => setHighlightedRow(index)}
                      onHoverEnd={() => setHighlightedRow(null)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${highlightedRow === index ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="font-medium text-gray-900">{loc.location}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatValue(loc.price_per_sqft, ' / sqft')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`${loc.percent_increase > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatValue(loc.percent_increase, '%')}
                          </span>
                          {loc.percent_increase > 0 && <ArrowUp className={`w-3.5 h-3.5 ${isRTL ? 'mr-1' : 'ml-1'} text-green-500`} />}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-gray-500">{formatValue(loc.rental_yield, '%')}</span>
                          {loc.rental_yield > 4 && <DollarSign className={`w-3.5 h-3.5 ${isRTL ? 'mr-1' : 'ml-1'} text-yellow-500`} />}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
          >
            {validRentalYields.length === 0 || validAppreciations.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6">
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle className={`h-5 w-5 text-yellow-600 ${isRTL ? 'ml-2' : 'mr-2'} mt-0.5 flex-shrink-0`} />
                  <p className="text-yellow-700">
                    {t('aiAgent.locationTrends.missingData')}
                  </p>
                </div>
              </div>
            ) : null}
            
            {/* Responsive grid - 1 column on mobile, 2 on medium screens */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            <div className={`bg-blue-50 p-4 sm:p-5 rounded-lg border border-blue-100 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Info className={`h-5 w-5 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                <h3 className="font-medium text-gray-800">{t('aiAgent.locationTrends.investmentInsights')}</h3>
              </div>
              
              <ul className="space-y-4 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                {bestRentalYield?.rental_yield > 0 && (
                  <motion.li 
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}></span>
                    <span className="break-words" dangerouslySetInnerHTML={{ __html: t('aiAgent.locationTrends.highestRentalYield', { location: bestRentalYield.location, yield: bestRentalYield.rental_yield }) }}>
                    </span>
                  </motion.li>
                )}
                
                {bestAppreciation?.percent_increase > 0 && (
                  <motion.li 
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}></span>
                    <span className="break-words" dangerouslySetInnerHTML={{ __html: t('aiAgent.locationTrends.strongestAppreciation', { location: bestAppreciation.location, appreciation: bestAppreciation.percent_increase }) }}>
                    </span>
                  </motion.li>
                )}
                
                <motion.li 
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`}></span>
                  <span className="break-words">
                    {t('aiAgent.locationTrends.balancedOpportunities')}
                  </span>
                </motion.li>
                
                {processedLocations.some(loc => loc.rental_yield == null || loc.percent_increase == null) && (
                  <motion.li 
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`flex items-start text-amber-700 bg-amber-50 p-3 rounded-md ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <AlertCircle className={`w-4 h-4 mt-0.5 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                    <span>
                      {t('aiAgent.locationTrends.missingDataDisclaimer')}
                    </span>
                  </motion.li>
                )}
              </ul>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

LocationTrends.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      location: PropTypes.string.isRequired,
      price_per_sqft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      percent_increase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      rental_yield: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  )
};

export default LocationTrends;