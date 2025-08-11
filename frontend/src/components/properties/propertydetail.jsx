import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BedDouble, 
  Bath, 
  Maximize, 
  ArrowLeft, 
  Phone, 
  Calendar, 
  MapPin,
  Loader,
  Building,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Compass,
  Home,
  SparkleIcon, 
  DollarSign,
  MoveRight,
  ArrowRight,
  X
} from "lucide-react";
import { Backendurl } from "../../App.jsx";
import ScheduleViewing from "./ScheduleViewing";
import { getPropertyTypes, getCities } from "../../services/api";
import PropertyReviews from './PropertyReviews';
import VR360Embed from "../VR360Embed.jsx";
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nHelpers';

const PropertyDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [propertyTypeName, setPropertyTypeName] = useState("");
  const [cityName, setCityName] = useState("");
  const navigate = useNavigate();
  const [showVR, setShowVR] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/products/single/${id}`);

        if (response.data.success) {
          setProperty(response.data.property);
          setError(null);
        } else {
          setError(response.data.message || "Failed to load property details.");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    // Reset scroll position and active image when component mounts
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  // Fetch property type and city names if only IDs are present
  useEffect(() => {
    if (property) {
      if (property.propertyType && typeof property.propertyType === 'string') {
        getPropertyTypes().then(types => {
          const found = types.find(t => t._id === property.propertyType);
          setPropertyTypeName(found ? found.type_name : property.type);
        });
      } else if (property.propertyType && property.propertyType.type_name) {
        setPropertyTypeName(property.propertyType.type_name);
      } else {
        setPropertyTypeName(property.type);
      }
      if (property.city && typeof property.city === 'string') {
        getCities().then(cities => {
          const found = cities.find(c => c._id === property.city);
          setCityName(found ? found.city_name : '');
        });
      } else if (property.city && property.city.city_name) {
        setCityName(property.city.city_name);
      } else {
        setCityName('');
      }
    }
  }, [property]);

  const handleKeyNavigation = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      setActiveImage(prev => (prev === 0 ? property.image.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveImage(prev => (prev === property.image.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'Escape' && showSchedule) {
      setShowSchedule(false);
    }
  }, [property?.image?.length, showSchedule]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out this ${propertyTypeName}: ${title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            to="/properties"
            className="text-blue-600 hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const DEMO_VR_TOUR_URL = "https://my.matterport.com/show/?m=zEWsxhZpGba&play=1&qs=1";

  // Fallback logic for dynamic content
  const title = getLocalizedText(property.title);
  const description = getLocalizedText(property.description);
  const city = getLocalizedText(property.city?.city_name);
  const propertyType = getLocalizedText(property.propertyType?.type_name);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            {i18n.dir() === 'rtl' ? <ArrowRight className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2'}`} /> : <ArrowLeft className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2'}`} />} {t('property.backToProperties')}
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              hover:bg-gray-100 transition-colors relative"
          >
            {copySuccess ? (
              <span className="text-green-600">
                <Copy className="w-5 h-5" />
                {t('property.copied')}
              </span>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                {t('property.share')}
              </>
            )}
          </button>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-[500px] bg-gray-100 rounded-xl overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={property.image[activeImage]?.startsWith('/uploads/') ? `${Backendurl}${encodeURI(property.image[activeImage])}` : property.image[activeImage]}
                alt={`${title} - View ${activeImage + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              />
            </AnimatePresence>

            {/* Image Navigation */}
            {property.image.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(prev => 
                    prev === 0 ? property.image.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImage(prev => 
                    prev === property.image.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
              bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {t('property.imageCounter', { current: activeImage + 1, total: property.image.length })}
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <div className="flex items-center text-gray-600 gap-4">
                  {city && (
                    <span className="flex items-center bg-blue-100 px-2 py-1 rounded text-xs ml-2">
                      <MapPin className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'} text-blue-600`} />
                      {city}
                    </span>
                  )}
                  {propertyType && (
                    <span className="flex items-center bg-blue-100 px-2 py-1 rounded text-xs ml-2">
                      <Home className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'} text-blue-600`} />
                      {propertyType}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100"
                title={t('property.share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Property Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.status === 'available' ? 'bg-green-100 text-green-800' : property.status === 'rented' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {property.status ? t(`property.status.${property.status}`) : t('property.status.available')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <p className="text-green-600">
                    {property.availability ? t(`property.availability.for_${property.availability}`) : t('property.availability.for_sale')}
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mb-2 flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-600" /> {Number(property.price).toLocaleString('en-US')}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <BedDouble className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.beds} {property.beds > 1 ? t('property.beds') : t('property.bed')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {property.baths} {property.baths > 1 ? t('property.baths') : t('property.bath')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Maximize className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{property.sqft} {t('property.sqftUnit')}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSchedule(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg 
                    hover:bg-blue-700 transition-colors flex items-center 
                    justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {t('scheduleViewing.title')}
                </button>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('listingType')}</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {property.availability ? t(`property.availability.${property.availability}`) : t('property.availability.for_sale')}
                  </p>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('description')}</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">{t('amenities')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {property.amenities.map((amenity, index) => (
                        <div 
                          key={amenity._id || index}
                          className="flex items-center text-gray-600"
                        >
                          <SparkleIcon className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2'} text-blue-600`} />
                          {getLocalizedText(amenity.name)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* VR Tour Section */}
        {property.vrTourLink && (
          <div className="mt-8">
            <AnimatePresence>
              {showVR ? (
                <motion.div
                  key="vr-embed"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto', transition: { duration: 0.5 } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.5 } }}
                  className="relative"
                >
                  <VR360Embed tourUrl={property.vrTourLink || DEMO_VR_TOUR_URL} />
                  <button
                    onClick={() => setShowVR(false)}
                    className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 text-gray-800 hover:bg-white transition"
                    aria-label={t('property.closeVrTour')}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="vr-launcher"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="relative h-64 rounded-xl overflow-hidden flex items-center justify-center text-center p-8 bg-cover bg-center"
                    style={{ backgroundImage: `url(${property.image[0]?.startsWith('/uploads/') ? `${Backendurl}${encodeURI(property.image[0])}` : property.image[0]})` }}
                  >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                      <SparkleIcon className="w-12 h-12 text-white mx-auto mb-4 opacity-80" />
                      <h2 className="text-3xl font-bold text-white mb-2">{t('immersiveTour')}</h2>
                      <p className="text-white/80 mb-6">{t('stepInside')}</p>
                      <button
                        onClick={() => setShowVR(true)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transition-all"
                      >
                        <Compass className="w-6 h-6" />
                        {t('launchVirtualTour')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Add Map Location */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 text-black-600 mb-4">
          <Compass className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            {city}
            </h3>
          </div>
          {property.mapUrl ? (
            <a
              href={property.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'rotate-180' : ''}`} />
              {t('property.viewExactLocation')}
            </a>
          ) : (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(city || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'rotate-180' : ''}`} />
              {t('property.viewExactLocation')}
            </a>
          )}
        </div>

        {/* Property Reviews Section */}
        <div className="mt-8">
          <PropertyReviews propertyId={property._id} />
        </div>

        {/* Viewing Modal */}
        <AnimatePresence>
          {showSchedule && (
            <ScheduleViewing
              propertyId={property._id}
              onClose={() => setShowSchedule(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;