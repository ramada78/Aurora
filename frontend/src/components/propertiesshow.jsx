import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  HomeIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from './properties/Propertycard.jsx';
import { Backendurl } from '../App';
import { getPropertyTypes } from '../services/api';
import { useTranslation } from 'react-i18next';


const PropertiesShow = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const categories = [
    { id: 'all', label: t('all_properties') },
    ...propertyTypes.map(type => ({ id: type.type_name, label: type.type_name }))
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/products/list`);
        
        if (response.data.success) {
          // Take only the first 6 properties for featured section
          const featuredProperties = response.data.property.slice(0, 6);
          setProperties(featuredProperties);
        } else {
          setError('Failed to fetch properties');
          // Fallback to sample data in case of API error
          setProperties(sampleProperties);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Using sample data instead.');
        // Fallback to sample data
        setProperties(sampleProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    getPropertyTypes().then(setPropertyTypes);
  }, []);

  const filteredProperties = (() => {
    let filtered = [];
    if (activeCategory === 'all') {
      filtered = [...properties];
    } else {
      filtered = properties.filter(property => {
        const typeName = property.propertyType?.type_name || '';
        return typeName.toLowerCase() === activeCategory.toLowerCase();
      });
    }
    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered.slice(0, 3);
  })();

  const viewAllProperties = () => {
    navigate('/properties');
  };

  if (loading) {
    return (
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4 mx-auto mb-16"></div>
            
            <div className="h-10 bg-gray-100 rounded-lg w-full max-w-md mx-auto mb-8 flex justify-center gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-8 bg-gray-200 rounded-full w-24"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow h-96">
                  <div className="h-64 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">{t('explore_properties')}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            {t('featured_properties')}
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('featured_properties_desc')}
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 border-2
                ${activeCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8 max-w-md mx-auto text-center"
          >
            <p className="font-medium mb-1">Note: {error}</p>
            <p className="text-sm">Showing sample properties for demonstration.</p>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProperties.map((property, idx) => (
              <PropertyCard key={property._id || idx} property={property} viewType="grid" />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={viewAllProperties}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-medium"
          >
            {t('browse_all_properties')}
            <HomeIcon className="ml-2 mr-2 w-4 h-4" />
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            {t('featured_properties_full_desc')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertiesShow;