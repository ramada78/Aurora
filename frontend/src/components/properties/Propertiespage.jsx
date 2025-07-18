import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, SlidersHorizontal, MapPin, Home } from "lucide-react";
import SearchBar from "./Searchbar.jsx";
import FilterSection from "./Filtersection.jsx";
import PropertyCard from "./Propertycard.jsx";
import { Backendurl } from "../../App.jsx";
import { getPropertyTypes, getCities, saveLastSearch as saveLastSearchAPI } from "../../services/api";
import { useLocation } from "react-router-dom";

const PropertiesPage = () => {
  const location = useLocation();
  const [viewState, setViewState] = useState({
    isGridView: true,
    showFilters: false,
    showMap: false,
  });

  const [propertyState, setPropertyState] = useState({
    properties: [],
    loading: true,
    error: null,
    selectedProperty: null,
  });

  const [amenities, setAmenities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: "0",
    bathrooms: "0",
    area: "0",
    availability: "",
    city: "",
    searchQuery: "",
    sortBy: "",
    status: "",
    amenities: [], // amenity IDs
  });

  useEffect(() => {
    getPropertyTypes().then(setPropertyTypes);
    getCities().then(setCities);
  }, []);

  useEffect(() => {
    // Set city and propertyType filter from URL query param on mount
    const params = new URLSearchParams(location.search);
    const cityParam = params.get('city');
    const propertyTypeParam = params.get('propertyType');
    setFilters(prev => {
      const updated = {
        ...prev,
        city: cityParam || prev.city,
        propertyType: propertyTypeParam || prev.propertyType
      };
      // Save to preferences if city/propertyType is present in URL
      if (cityParam || propertyTypeParam) {
        saveLastSearch(updated);
      }
      return updated;
    });
  }, [location.search]);

  const propertyTypeMap = useMemo(() => {
    const map = {};
    propertyTypes.forEach(pt => { map[pt._id] = pt.type_name; });
    return map;
  }, [propertyTypes]);

  const cityMap = useMemo(() => {
    const map = {};
    cities.forEach(c => { map[c._id] = c.city_name; });
    return map;
  }, [cities]);

  const fetchProperties = async () => {
    try {
      setPropertyState((prev) => ({ ...prev, loading: true }));
      const response = await axios.get(`${Backendurl}/api/products/list`);
      if (response.data.success) {
        setPropertyState((prev) => ({
          ...prev,
          properties: response.data.property,
          error: null,
          loading: false,
        }));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setPropertyState((prev) => ({
        ...prev,
        error: "Failed to fetch properties. Please try again later.",
        loading: false,
      }));
      console.error("Error fetching properties:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
    // Fetch amenities for filter
    axios.get(`${Backendurl}/api/products/amenities`).then(res => {
      if (res.data.success) setAmenities(res.data.amenities);
    });
  }, []);

  // Get logged-in user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const filteredProperties = useMemo(() => {
    let props = propertyState.properties;
    // Restrict for agent/seller
    if (!isAdmin) {
      if (roles.includes('agent')) {
        props = props.filter(p => p.agent && p.agent === user._id);
      } else if (roles.includes('seller')) {
        props = props.filter(p => p.seller && p.seller === user._id);
      }
    }
    return props
      .filter((property) => {
        const searchMatch = !filters.searchQuery || 
          [property.title, property.description, property.city?.city_name, property.propertyType?.type_name]
            .some(field => field?.toLowerCase().includes(filters.searchQuery.toLowerCase()));

        // Property Type filter (new)
        const typeMatch = !filters.propertyType || 
          property.propertyType?.type_name?.toLowerCase() === filters.propertyType.toLowerCase();

        // City filter (partial match)
        const cityMatch = !filters.city || 
          property.city?.city_name?.toLowerCase().includes(filters.city.toLowerCase());

        // Price filter (USD)
        const minPrice = filters.minPrice === '' || filters.minPrice === undefined ? -Infinity : Number(filters.minPrice);
        const maxPrice = filters.maxPrice === '' || filters.maxPrice === undefined ? Infinity : Number(filters.maxPrice);
        const priceMatch = property.price >= minPrice && property.price <= maxPrice;

        // Bedrooms, Bathrooms, Area
        const bedroomsMatch = !filters.bedrooms || filters.bedrooms === "0" || 
          property.beds >= parseInt(filters.bedrooms);
        const bathroomsMatch = !filters.bathrooms || filters.bathrooms === "0" || 
          property.baths >= parseInt(filters.bathrooms);
        const areaMatch = !filters.area || filters.area === "0" || 
          property.sqft >= parseInt(filters.area);

        // Availability
        const availabilityMatch = !filters.availability || 
          property.availability?.toLowerCase() === filters.availability.toLowerCase();

        // Amenities filter: all selected must be present in property.amenities
        const amenitiesMatch = !filters.amenities.length ||
          filters.amenities.every(aid => property.amenities.some(a => a._id === aid));

        // Property Status filter
        const statusMatch = !filters.status || property.status === filters.status;

        return searchMatch && typeMatch && cityMatch && priceMatch && 
          bedroomsMatch && bathroomsMatch && areaMatch && availabilityMatch && amenitiesMatch && statusMatch;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "newest":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default:
            return 0;
        }
      });
  }, [propertyState.properties, filters]);

  const numericFields = ['minPrice','maxPrice','bedrooms','bathrooms','area','beds','price','sqft'];
  const coerceNumericFilters = (filters) => {
    const result = { ...filters };
    numericFields.forEach(f => {
      if (result[f] !== undefined && result[f] !== '' && result[f] !== null) {
        const n = Number(result[f]);
        if (!isNaN(n)) result[f] = n;
      }
    });
    return result;
  };

  const saveLastSearch = async (searchObj) => {
    const coerced = coerceNumericFilters(searchObj);
    console.log('Saving filter for AI aggregation:', coerced);
    const token = localStorage.getItem('token');
    if (token) {
      await saveLastSearchAPI(coerced);
    } else {
      let arr = JSON.parse(localStorage.getItem('lastSearches') || '[]');
      arr = [coerced, ...arr.filter(s => JSON.stringify(s) !== JSON.stringify(coerced))].slice(0, 10);
      localStorage.setItem('lastSearches', JSON.stringify(arr));
    }
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = {
      ...filters,
      ...newFilters
    };
    setFilters(updatedFilters);
    // Do NOT saveLastSearch here
  };

  // Add a handler for numeric blur
  const handleNumericBlur = () => {
    saveLastSearch(filters);
  };

  // Add a handler for non-numeric changes
  const handleNonNumericChange = (newFilters) => {
    saveLastSearch(newFilters);
  };

  if (propertyState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center"
        >
          <div className="relative mb-6">
            {/* Main loader animation */}
            <motion.div
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center relative shadow-lg shadow-blue-500/30"
              animate={{ 
                rotate: [0, 0, 360, 360, 0],
                scale: [1, 0.9, 0.9, 1, 1],
                borderRadius: ["16%", "50%", "50%", "16%", "16%"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Home className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* Moving dots around the icon */}
            <motion.div 
              className="absolute w-3 h-3 bg-blue-300 rounded-full right-4 bottom-10"
              animate={{
                x: [0, 30, 0, -30, 0],
                y: [-30, 0, 30, 0, -30],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.div 
              className="absolute w-2 h-2 bg-indigo-400 rounded-full"
              animate={{
                x: [0, -30, 0, 30, 0],
                y: [30, 0, -30, 0, 30],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
  
            {/* Background pulse effect */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Loading Properties
          </h3>
          
          <p className="text-gray-600 mb-5 max-w-xs text-center">
            {`We're finding the perfect homes that match your preferences...`}
          </p>
          
          {/* Progress bar with animated gradient */}
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-size-200 absolute top-0 left-0 right-0"
              animate={{ 
                backgroundPosition: ["0% center", "100% center", "0% center"] 
              }}
              style={{ backgroundSize: "200% 100%" }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <div className="flex items-center mt-4 text-xs text-blue-600">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"
            />
            <span>Please wait while we curate properties for you</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (propertyState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-600 p-6 rounded-lg bg-red-50 max-w-md"
        >
          <p className="font-medium mb-4">{propertyState.error}</p>
          <button
            onClick={fetchProperties}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transition-colors duration-200"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover a curated collection of Future Real Estate
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="wait">
            {viewState.showFilters && (
              <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="lg:col-span-1"
              >
                <FilterSection
                  filters={filters}
                  setFilters={setFilters}
                  onApplyFilters={handleFilterChange}
                  onNumericBlur={handleNumericBlur}
                  onNonNumericChange={handleNonNumericChange}
                  amenities={amenities}
                  propertyTypes={propertyTypes}
                  cities={cities}
                />
              </motion.aside>
            )}
          </AnimatePresence>

          <div className={`${viewState.showFilters ? "lg:col-span-3" : "lg:col-span-4"}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <SearchBar
                  onSearch={(query) => {
                    const updatedFilters = { ...filters, searchQuery: query };
                    setFilters(updatedFilters);
                    saveLastSearch(updatedFilters);
                  }}
                  className="flex-1"
                />

                <div className="flex items-center gap-4">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Sort By</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewState(prev => ({
                        ...prev,
                        showFilters: !prev.showFilters
                      }))}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Toggle Filters"
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewState(prev => ({ ...prev, isGridView: true }))}
                      className={`p-2 rounded-lg ${
                        viewState.isGridView ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewState(prev => ({ ...prev, isGridView: false }))}
                      className={`p-2 rounded-lg ${
                        !viewState.isGridView ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              layout
              className={`grid gap-6 ${
                viewState.isGridView ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <AnimatePresence>
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      viewType={viewState.isGridView ? "grid" : "list"}
                      propertyTypeName={propertyTypeMap[property.propertyType] || property.type}
                      cityName={cityMap[property.city]}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm"
                  >
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No properties found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search criteria
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertiesPage;