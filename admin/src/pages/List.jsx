import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Plus, 
  Home,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Building,
  Loader,
  Eye // <-- Add Eye icon
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendurl } from "../App";

const PropertyListings = () => {
  const { t, i18n } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [showMineOnly, setShowMineOnly] = useState(false);
  // Remove myAgentId and mySellerId logic
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get(`${backendurl}/api/property-types?lang=${i18n.language}`).then(res => {
      if (res.data.success) setPropertyTypes(res.data.types);
    });
    axios.get(`${backendurl}/api/cities?lang=${i18n.language}`).then(res => {
      if (res.data.success) setCities(res.data.cities);
    });
  }, [i18n.language]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/products/list?lang=${i18n.language}`);
      if (response.data.success) {
        const parsedProperties = response.data.property.map(property => ({
          ...property,
          amenities: parseAmenities(property.amenities)
        }));
        setProperties(parsedProperties);
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const parseAmenities = (amenities) => {
    if (!amenities || !Array.isArray(amenities)) return [];
    try {
      return typeof amenities[0] === "string" 
        ? JSON.parse(amenities[0].replace(/'/g, '"'))
        : amenities;
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [i18n.language]);


  // Add handleRemoveProperty function
  const handleRemoveProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(t('properties.property.deleteConfirm', { title: propertyTitle }))) return;
    try {
      const deleteResponse = await axios.post(
        `${backendurl}/api/products/remove`,
        { id: propertyId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (deleteResponse.data.success) {
        toast.success(t('properties.property.deleteSuccess'));
        fetchProperties();
      } else {
        toast.error(deleteResponse.data.message || t('properties.property.deleteError'));
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('properties.property.deleteErrorGeneric'));
      }
    }
  };
  // Updated filter logic for 'Show Only Mine'
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
                  [(i18n.language === 'ar' ? property.title?.ar : property.title?.en) || (i18n.language === 'ar' ? property.propertyType?.type_name?.ar : property.propertyType?.type_name?.en) || (i18n.language === 'ar' ? property.city?.city_name?.ar : property.city?.city_name?.en)]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || (i18n.language === 'ar' ? property.propertyType?.type_name?.ar : property.propertyType?.type_name?.en)?.toLowerCase() === filterType.toLowerCase();
    const matchesCity = filterCity === "all" || (i18n.language === 'ar' ? property.city?.city_name?.ar : property.city?.city_name?.en)?.toLowerCase() === filterCity.toLowerCase();
    // If showMineOnly is ON, filter by agent or seller (user._id)
    const matchesMine = !showMineOnly ||
      (user && user._id && (
        (property.agent && String(property.agent._id || property.agent) === String(user._id)) ||
        (property.seller && String(property.seller._id || property.seller) === String(user._id))
      ));
    return matchesSearch && matchesType && matchesCity && matchesMine;
  })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Properties</h3>
          <p className="text-gray-600">{t('properties.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('properties.title')}
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            {!user.isAdmin && (
              <button
                onClick={() => setShowMineOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${showMineOnly ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-600 hover:from-blue-600 hover:to-purple-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
              >
                {showMineOnly ? t('properties.showAll') : t('properties.showMyPropertiesOnly')}
              </button>
            )}
            <Link to="/add" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <Plus className="w-5 h-5" /> {t('properties.addProperty')}
            </Link>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('properties.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="all">{t('properties.filters.allTypes')}</option>
                  {propertyTypes.map(type => (
                    <option key={type._id} value={i18n.language === 'ar' ? type.type_name?.ar : type.type_name?.en}>
                      {i18n.language === 'ar' ? type.type_name?.ar : type.type_name?.en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="all">{t('properties.filters.allCities')}</option>
                  {cities.map(city => (
                    <option key={city._id} value={i18n.language === 'ar' ? city.city_name?.ar : city.city_name?.en}>
                      {i18n.language === 'ar' ? city.city_name?.ar : city.city_name?.en}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="newest">{t('properties.filters.newestFirst')}</option>
                <option value="price-low">{t('properties.filters.priceLowToHigh')}</option>
                <option value="price-high">{t('properties.filters.priceHighToLow')}</option>
              </select>
            </div>
          </div>
        </motion.div>
        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-blue-200/50 group"
              >
                {/* Property Image */}
                <div className="relative h-48">
                  {/* Status Badge Top Left */}
                  <div className="absolute top-2 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.status === 'available' ? 'bg-green-100 text-green-800' : property.status === 'rented' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {property.status ? t(`properties.status.${property.status}`) : t('properties.status.available')}
                    </span>
                  </div>
                  <img
                    src={property.image[0]?.startsWith('/uploads/') ? `${backendurl}${property.image[0]}` : property.image[0] || "/placeholder.jpg"}
                    alt={property.displayTitle || property.title?.en || property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Edit/Remove icons in top right */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Link to={`/update/${property._id}`} className="p-2 bg-white/80 rounded-full shadow hover:bg-blue-100 transition-colors group-hover:scale-110" title={t('properties.property.edit')}>
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </Link>
                    <button
                      onClick={() => handleRemoveProperty(property._id, property.displayTitle || property.title?.en || property.title)}
                      className="p-2 bg-white/80 rounded-full shadow hover:bg-red-100 transition-colors group-hover:scale-110"
                      title={t('properties.property.remove')}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  {/* Views tag in bottom right */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full shadow text-gray-700 text-xs font-medium">
                    <Eye className="w-4 h-4 mr-1 text-blue-500" />
                    {Math.floor(property.views || 0)} {t('properties.property.views')}
                  </div>
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full flex items-center gap-1 shadow-lg">
                      <Home className="w-4 h-4 mr-1" />
                      {i18n.language === 'ar' ? property.propertyType?.type_name?.ar : property.propertyType?.type_name?.en || property.propertyType?.type_name || t('properties.property.unknownType')}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {property.displayTitle || property.title?.en || property.title}
                    </h2>
                    <div className="flex items-center text-gray-600 gap-1">
                      <MapPin className="w-4 h-4" />
                      {i18n.language === 'ar' ? property.city?.city_name?.ar : property.city?.city_name?.en || t('properties.property.unknownCity')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Show price in USD */}
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${property.price ? property.price.toLocaleString("en-US", { style: "decimal", maximumFractionDigits: 0 }) : 0}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.availability === 'rent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {property.availability === 'rent' ? t('properties.property.forRent') : t('properties.property.forSale')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      <BedDouble className="w-5 h-5 text-blue-500 mb-1" />
                      <span className="text-sm text-gray-600 font-medium">{property.beds} {t('properties.property.beds')}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      <Bath className="w-5 h-5 text-purple-500 mb-1" />
                      <span className="text-sm text-gray-600 font-medium">{property.baths} {t('properties.property.baths')}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      <Maximize className="w-5 h-5 text-indigo-500 mb-1" />
                      <span className="text-sm text-gray-600 font-medium">{property.sqft} {t('properties.property.sqft')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PropertyListings;