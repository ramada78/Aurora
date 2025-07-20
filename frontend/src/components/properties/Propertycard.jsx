import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  IndianRupee, 
  BedDouble, 
  Bath, 
  Maximize,
  Share2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Home,
  SparkleIcon,
  DollarSign,
  Heart
} from 'lucide-react';
import PropTypes from 'prop-types';
import { Backendurl } from '../../App.jsx';
import { getWishlist, addToWishlist, removeFromWishlist } from '../../services/api';

const PropertyCard = ({ property, viewType, propertyTypeName, cityName }) => {
  const isGrid = viewType === 'grid';
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [saving, setSaving] = useState(false);

  // Get logged-in user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const canEdit = isAdmin || (roles.includes('agent') && property.agent === user._id) || (roles.includes('seller') && property.seller === user._id);

  useEffect(() => {
    // Fetch wishlist on mount
    getWishlist().then(setWishlist).catch(() => setWishlist([]));
  }, []);

  const isSaved = wishlist.some(p => p._id === property._id);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    setSaving(true);
    try {
      if (isSaved) {
        await removeFromWishlist(property._id);
        setWishlist(wishlist.filter(p => p._id !== property._id));
      } else {
        await addToWishlist(property._id);
        setWishlist([...wishlist, property]);
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateToDetails = () => {
    navigate(`/properties/single/${property._id}`);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImageNavigation = (e, direction) => {
    e.stopPropagation();
    const imagesCount = property.image.length;
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % imagesCount);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300
        ${isGrid ? 'flex flex-col' : 'flex flex-row gap-6'}`}
      onClick={handleNavigateToDetails}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Image Carousel Section */}
      <div className={`relative ${isGrid ? 'h-64' : 'w-96'}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={property.image[currentImageIndex]?.startsWith('/uploads/') ? `${Backendurl}${encodeURI(property.image[currentImageIndex])}` : property.image[currentImageIndex]}
            alt={property.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover rounded-t-xl rounded-b-none"
          />
        </AnimatePresence>

        {/* Wishlist Heart Button */}
        <button
          className={`absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-pink-100 transition-colors border ${isSaved ? 'border-pink-500' : 'border-gray-200'}`}
          onClick={handleWishlist}
          disabled={saving}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-6 h-6 ${isSaved ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
        </button>

        {/* Image Navigation Controls */}
        {showControls && property.image.length > 1 && (
          <>
            <button
              onClick={e => handleImageNavigation(e, 'prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={e => handleImageNavigation(e, 'next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Property badges */}
        {/* Status badge: top left */}
        <div className="absolute top-4 left-4 z-10">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${property.status === 'available' ? 'bg-green-500 text-white' : property.status === 'rented' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Available'}
          </motion.span>
        </div>
        {/* Property type badge: bottom left */}
        <div className="absolute bottom-4 left-4 z-10">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1"
          >
            <Home className="w-4 h-4 mr-1" />
            {property.propertyType?.type_name}
          </motion.span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full shadow text-gray-700 text-xs font-medium">
                    <Eye className="w-4 h-4 mr-1 text-blue-500" />
                    {Math.floor(property.views || 0)}
                  </div>
      </div>

      {/* Content Section */}
      <div className={`flex-1 p-6 ${isGrid ? '' : 'flex flex-col justify-between'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            {property.city?.city_name ||''}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {Number(property.price).toLocaleString('en-US')}
              </span>
              <span className="ml-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {property.availability}
              </span>
            </div>
          </div>
        </div>
        {/* Property Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 rounded-lg">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {property.beds} {property.beds > 1 ? 'Beds' : 'Bed'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 rounded-lg">
            <Bath className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {property.baths} {property.baths > 1 ? 'Baths' : 'Bath'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 rounded-lg">
            <Maximize className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {property.sqft} sqft
            </span>
          </div>
        </div>
        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={amenity._id || idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                <SparkleIcon className="w-3 h-3 mr-1" />
                {amenity.name}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
        {/* Edit/Delete Buttons (only for owner or admin) */}
        {canEdit && (
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
            <button className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  viewType: PropTypes.string.isRequired,
  propertyTypeName: PropTypes.string,
  cityName: PropTypes.string
};

export default PropertyCard;