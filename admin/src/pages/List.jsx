import React, { useState, useEffect } from "react";
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
    axios.get(`${backendurl}/api/property-types`).then(res => {
      if (res.data.success) setPropertyTypes(res.data.types);
    });
    axios.get(`${backendurl}/api/cities`).then(res => {
      if (res.data.success) setCities(res.data.cities);
    });
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/products/list`);
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
  }, []);

  const propertyTypeMap = propertyTypes.reduce((acc, pt) => { acc[pt._id] = pt.type_name; return acc; }, {});
  const cityMap = cities.reduce((acc, c) => { acc[c._id] = c.city_name; return acc; }, {});

  // Add handleRemoveProperty function
  const handleRemoveProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(`Are you sure you want to delete property: ${propertyTitle}?`)) return;
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
        toast.success("Property deleted successfully");
        fetchProperties();
      } else {
        toast.error(deleteResponse.data.message || "Failed to delete property");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting property");
      }
    }
  };
  // Updated filter logic for 'Show Only Mine'
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      [property.title, property.location, property.propertyType?.type_name || property.type]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || (property.propertyType?.type_name || property.type)?.toLowerCase() === filterType.toLowerCase();
    const matchesCity = filterCity === "all" || (property.city?.city_name)?.toLowerCase() === filterCity.toLowerCase();
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
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
          <div className="flex gap-4 items-center">
            {!user.isAdmin && (
              <button
                onClick={() => setShowMineOnly((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${showMineOnly ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
              >
                {showMineOnly ? 'Show All' : 'Show My Properties Only'}
              </button>
            )}
            <Link to="/add" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" /> Add Property
            </Link>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type._id} value={type.type_name}>{type.type_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city._id} value={city.city_name}>{city.city_name}</option>
                  ))}
                </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProperties.map((property) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Property Image */}
                <div className="relative h-48">
                  {/* Status Badge Top Left */}
                  <div className="absolute top-2 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.status === 'available' ? 'bg-green-100 text-green-800' : property.status === 'rented' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Available'}
                    </span>
                  </div>
                  <img
                    src={property.image[0]?.startsWith('/uploads/') ? `${backendurl}${property.image[0]}` : property.image[0] || "/placeholder.jpg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Edit/Remove icons in top right */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Link to={`/update/${property._id}`} className="p-2 bg-white/80 rounded-full shadow hover:bg-blue-100 transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </Link>
                    <button
                      onClick={() => handleRemoveProperty(property._id, property.title)}
                      className="p-2 bg-white/80 rounded-full shadow hover:bg-red-100 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  {/* Views tag in bottom right */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full shadow text-gray-700 text-xs font-medium">
                    <Eye className="w-4 h-4 mr-1 text-blue-500" />
                    {Math.floor(property.views || 0)}
                  </div>
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <Home className="w-4 h-4 mr-1" />
                      {property.propertyType?.type_name || "Unknown Type"}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h2>
                    <div className="flex items-center text-gray-600 gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.city?.city_name || "Unknown City"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Show price in USD */}
                    <p className="text-2xl font-bold text-blue-600">
                      ${property.price ? property.price.toLocaleString("en-US", { style: "decimal", maximumFractionDigits: 0 }) : 0}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.availability === 'rent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      For {property.availability}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <BedDouble className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.beds} Beds</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <Bath className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.baths} Baths</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <Maximize className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">{property.sqft} sqft</span>
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