import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MapPin, Maximize, BedDouble, Bath, Building, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PropertyCard = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  if (!property) return null;

  // Debug: Log the property object to see its structure
  console.log('Property data:', property);

  // Helper function to get image URL
  const getImageUrl = () => {
    // Based on the actual data structure
    if (property.image && typeof property.image === 'string') {
      return property.image;
    }
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return null;
  };

  // Helper function to get location
  const getLocation = () => {
    // Based on the actual data structure
    if (property.city && typeof property.city === 'string') {
      return property.city;
    }
    if (property.city_name) return property.city_name;
    if (property.city?.city_name) return property.city.city_name;
    if (property.location) return property.location;
    return null;
  };

  // Helper function to get property type
  const getPropertyType = () => {
    // Based on the actual data structure
    if (property.propertyType && typeof property.propertyType === 'string') {
      return property.propertyType;
    }
    if (property.propertyType?.type_name) return property.propertyType.type_name;
    if (property.property_type) return property.property_type;
    return null;
  };

  // Helper function to get property type in Arabic
  const getPropertyTypeAr = () => {
    // For now, return the same as English since we don't have Arabic data
    return getPropertyType();
  };

  const statusText = property.status ? t(`property.status.${property.status.toLowerCase()}`, property.status.charAt(0).toUpperCase() + property.status.slice(1)) : t('property.status.unknown');
  
  const statusColors = {
    available: 'bg-green-100 text-green-700',
    rented: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700'
  };
  const statusColorClass = statusColors[property.status?.toLowerCase()] || statusColors.default;

  const imageUrl = getImageUrl();
  const location = getLocation();
  const propertyType = isRTL ? getPropertyTypeAr() : getPropertyType();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      {/* Image section */}
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`} 
            alt={property.title} 
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`text-gray-400 ${imageUrl ? 'hidden' : 'flex'} items-center justify-center`}>
          {t('property.noImage')}
        </div>
      </div>
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-5 relative ${isRTL ? 'text-right' : ''}`}>
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 truncate" title={property.title}>
            {property.title || t('property.noTitle')}
          </h3>
          <div className={`flex items-center text-blue-100 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRTL ? 'ml-1' : 'mr-1'} flex-shrink-0`} />
            <p className="text-xs sm:text-sm truncate" title={location}>
              {location || t('property.unknownLocation')}
            </p>
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Price and area information */}
        <div className={`flex items-center gap-3 mb-4 sm:mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">{t('property.price')}</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">${property.price?.toLocaleString() || 'N/A'}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">{t('property.area')}</p>
            <div className="flex items-center">
              <Maximize className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 mr-1" />
              <p className="text-sm sm:text-base font-medium text-gray-800">{property.sqft || property.area || 'N/A'} {t('property.sqftUnit')}</p>
            </div>
          </div>
        </div>
        {/* Beds, Baths, Type */}
        <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <div className={`flex items-center gap-1 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BedDouble className={`w-4 h-4 text-blue-500 ${isRTL ? 'ml-1' : ''}`} />
            {property.bedrooms || property.beds || 'N/A'} {t('property.beds')}
          </div>
          <div className={`flex items-center gap-1 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Bath className={`w-4 h-4 text-blue-500 ${isRTL ? 'ml-1' : ''}`} />
            {property.bathrooms || property.baths || 'N/A'} {t('property.baths')}
          </div>
          <div className={`flex items-center gap-1 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Building className={`w-4 h-4 text-blue-500 ${isRTL ? 'ml-1' : ''}`} />
            {propertyType || t('property.unknownType')}
          </div>
        </div>
        {/* Property description - Collapsible on mobile */}
        <div className="mb-4 sm:mb-5 flex-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex w-full items-center justify-between text-left sm:pointer-events-none ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <h4 className={`text-sm font-medium text-gray-700 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Building className={`w-4 h-4 text-blue-500 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
              {t('property.overview')}
            </h4>
            <motion.div 
              animate={{ rotate: isExpanded ? (isRTL ? -90 : 90) : 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden"
            >
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>
          <motion.div 
            animate={{ 
              height: isExpanded ? 'auto' : '3rem',
              opacity: 1 
            }}
            initial={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`overflow-hidden ${isExpanded ? '' : 'max-h-12 sm:max-h-none'}`}
          >
            <p className={`text-gray-600 text-xs sm:text-sm mt-2 ${isExpanded ? '' : 'line-clamp-3'} ${isRTL ? 'text-right' : ''}`}>
              {property.description || t('property.noDescription')}
            </p>
          </motion.div>
        </div>
        {/* Status */}
        <div className={`mt-auto ${isRTL ? 'text-right' : ''}`}>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
            {statusText}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
};

export default PropertyCard;