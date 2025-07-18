import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Building, MapPin, Maximize, Tag, Plus, ArrowRight, BedDouble, Bath } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (property._id) {
      navigate(`/properties/single/${property._id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Image section */}
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {property.image ? (
          <img src={property.image} alt={property.title} className="object-cover w-full h-full" />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-5 relative">
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 truncate" title={property.title}>
            {property.title || 'No Title'}
          </h3>
          <div className="flex items-center text-blue-100 flex-wrap">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <p className="text-xs sm:text-sm truncate" title={property.city}>
              {property.city || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Price and area information */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">Price</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">${property.price?.toLocaleString() || 'N/A'}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">Area</p>
            <div className="flex items-center">
              <Maximize className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 mr-1" />
              <p className="text-sm sm:text-base font-medium text-gray-800">{property.sqft || 'N/A'} sqft</p>
            </div>
          </div>
        </div>
        {/* Beds, Baths, Type */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-gray-600">
            <BedDouble className="w-4 h-4 text-blue-500" />
            {property.beds} Beds
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Bath className="w-4 h-4 text-blue-500" />
            {property.baths} Baths
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Building className="w-4 h-4 text-blue-500" />
            {property.propertyType}
          </div>
        </div>
        {/* Property description - Collapsible on mobile */}
        <div className="mb-4 sm:mb-5 flex-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between text-left sm:pointer-events-none"
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Building className="w-4 h-4 text-blue-500 mr-1.5" />
              Overview
            </h4>
            <motion.div 
              animate={{ rotate: isExpanded ? 90 : 0 }}
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
            <p className={`text-gray-600 text-xs sm:text-sm mt-2 ${isExpanded ? '' : 'line-clamp-3'}`}>
              {property.description || 'No description available.'}
            </p>
          </motion.div>
        </div>
        {/* Status */}
        <div className="mt-auto">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${property.status === 'available' ? 'bg-green-100 text-green-700' : property.status === 'rented' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Status Unknown'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    title: PropTypes.string,
    price: PropTypes.number,
    image: PropTypes.string,
    beds: PropTypes.number,
    baths: PropTypes.number,
    sqft: PropTypes.number,
    city: PropTypes.string,
    propertyType: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string
  })
};

export default PropertyCard;