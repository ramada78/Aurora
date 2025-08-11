// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const searchProperties = async (searchParams) => {
  try {
    const response = await api.post('/api/properties/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getLocationTrends = async (city) => {
  try {
    const response = await api.get(`/api/locations/${encodeURIComponent(city)}/trends`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location trends:', error);
    throw error;
  }
};

export const getPropertyTypes = async () => {
  try {
    const response = await api.get('/api/property-types');
    return response.data.types || [];
  } catch (error) {
    console.error('Error fetching property types:', error);
    return [];
  }
};

export const getPropertyTypeCounts = async () => {
  try {
    const response = await api.get('/api/property-types/counts');
    return response.data.types || [];
  } catch (error) {
    console.error('Error fetching property type counts:', error);
    return [];
  }
};

export const getCities = async () => {
  try {
    const response = await api.get('/api/cities');
    return response.data.cities || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getReviewsByPropertyId = async (propertyId) => {
  try {
    const response = await api.get(`/api/reviews?property_id=${propertyId}`);
    return response.data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const addReview = async (reviewData) => {
  try {
    const response = await api.post('/api/reviews', reviewData);
    return response.data.review;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getUserRoles = async () => {
  try {
    const response = await api.get('/api/users/roles');
    return response.data.roleData;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return {};
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/api/admin/stats');
    return response.data.stats || {};
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {};
  }
};

export const getTotalPropertyViews = async () => {
  try {
    const response = await api.get('/api/products/total-views');
    return response.data.totalViews || 0;
  } catch (error) {
    console.error('Error fetching total property views:', error);
    return 0;
  }
};

export const getCompletedTransactions = async () => {
  try {
    const response = await api.get('/api/transactions/count/completed');
    return response.data.count || 0;
  } catch (error) {
    console.error('Error fetching completed transactions:', error);
    return 0;
  }
};

export const saveLastSearch = async (lastSearch) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/api/users/last-search', { lastSearch }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } else {
      // Save to localStorage as an array of last 10
      let arr = JSON.parse(localStorage.getItem('lastSearches') || '[]');
      arr = [lastSearch, ...arr.filter(s => JSON.stringify(s) !== JSON.stringify(lastSearch))].slice(0, 10);
      localStorage.setItem('lastSearches', JSON.stringify(arr));
      return true;
    }
  } catch (error) {
    console.error('Error saving last search:', error);
    return false;
  }
};

export const getLastSearches = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await api.get('/api/users/last-search', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.lastSearches || [];
    } else {
      return JSON.parse(localStorage.getItem('lastSearches') || '[]');
    }
  } catch (error) {
    console.error('Error getting last searches:', error);
    return [];
  }
};

// Aggregate an array of search/filter objects into a single preference object
export const aggregatePreferences = (searches) => {
  if (!searches.length) return {};
  // For categorical: use most frequent; for numeric: use average (ignore 0, '0', '')
  const fields = ['price','propertyType','city','minPrice','maxPrice','bedrooms','bathrooms','area','availability','status'];
  const counts = {};
  const sums = {};
  const nums = {};
  searches.forEach(s => {
    fields.forEach(f => {
      const val = s[f];
      if (val !== undefined && val !== '' && val !== 0 && val !== '0') {
        if (typeof val === 'number' || (!isNaN(val) && val !== '' && val !== '0')) {
          // Numeric
          const numVal = typeof val === 'number' ? val : Number(val);
          if (!isNaN(numVal) && numVal !== 0) {
            sums[f] = (sums[f] || 0) + numVal;
            nums[f] = (nums[f] || 0) + 1;
          }
        } else {
          // Categorical
          counts[f] = counts[f] || {};
          counts[f][val] = (counts[f][val] || 0) + 1;
        }
      }
    });
  });
  const result = {};
  fields.forEach(f => {
    if (nums[f]) {
      result[f] = Math.round(sums[f] / nums[f]);
    } else if (counts[f]) {
      // Most frequent value
      result[f] = Object.entries(counts[f]).sort((a,b) => b[1]-a[1])[0][0];
    }
    // Fallback: use most recent non-empty value
    if ((result[f] === undefined || result[f] === '' || result[f] === 0 || result[f] === '0') && searches) {
      for (let i = 0; i < searches.length; i++) {
        const val = searches[i][f];
        if (val !== undefined && val !== '' && val !== 0 && val !== '0') {
          result[f] = val;
          break;
        }
      }
    }
  });
  // Special handling for price: use maxPrice if present
  if (result.maxPrice) result.price = result.maxPrice;
  // Fallback: use searchQuery for city/propertyType if missing
  if ((!result.city || result.city === '') && searches) {
    for (let i = 0; i < searches.length; i++) {
      const sq = searches[i].searchQuery;
      if (sq && typeof sq === 'string') {
        // Try to match known cities/types
        const lower = sq.toLowerCase();
        const cities = [];
        const types = ['apartment', 'villa', 'house', 'flat', 'studio'];
        let city = cities.find(c => lower.includes(c));
        let propertyType = types.find(t => lower.includes(t));
        if (city && !result.city) result.city = city.charAt(0).toUpperCase() + city.slice(1);
        if (propertyType && !result.propertyType) result.propertyType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
        if (result.city && result.propertyType) break;
      }
    }
  }
  return result;
};

// Helper function to map Arabic display text back to English for backend compatibility
const translateToBackendFormat = (preferences) => {
  const arabicToEnglishMap = {
    // Cities
    'حلب': 'Aleppo',
    'دمشق': 'Damascus', 
    'اللاذقية': 'Latakia',
    'طرطوس': 'Tartus',
    'حمص': 'Homs',
    'حماة': 'Hama',
    'درعا': 'Daraa',
    'دير الزور': 'Deir ez-Zor',
    'الرقة': 'Raqqa',
    'السويداء': 'As-Suwayda',
    'القنيطرة': 'Quneitra',
    'إدلب': 'Idlib',
    
    // Property Types
    'شقة': 'Apartment',
    'فيلا': 'Villa', 
    'منزل': 'House',
    'استوديو': 'Studio',
    'بنتهاوس': 'Penthouse',
    'دوبلكس': 'Duplex',
    'تاون هاوس': 'Townhouse',
    'أرض': 'Land',
    'مكتب': 'Office',
    'محل تجاري': 'Shop',
    'مستودع': 'Warehouse',
    
    // Availability
    'إيجار': 'rent',
    'شراء': 'buy',
    'بيع': 'sell',
    'للإيجار': 'rent',
    'للبيع': 'buy'
  };

  const translated = { ...preferences };
  
  // Translate city if it's in Arabic
  if (translated.city && arabicToEnglishMap[translated.city]) {
    translated.city = arabicToEnglishMap[translated.city];
  }
  
  // Translate propertyType if it's in Arabic
  if (translated.propertyType && arabicToEnglishMap[translated.propertyType]) {
    translated.propertyType = arabicToEnglishMap[translated.propertyType];
  }
  
  // Translate availability if it's in Arabic
  if (translated.availability && arabicToEnglishMap[translated.availability]) {
    translated.availability = arabicToEnglishMap[translated.availability];
  }
  
  return translated;
};

export const recommendProperties = async (preferences) => {
  try {
    // Translate Arabic display text to English backend format
    const backendPreferences = translateToBackendFormat(preferences);
    
    const response = await api.post('/api/properties/recommend', backendPreferences);
    return response.data.recommended || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

export const getWishlist = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/api/users/wishlist', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.wishlist || [];
};

export const addToWishlist = async (propertyId) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/api/users/wishlist/add', { propertyId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const removeFromWishlist = async (propertyId) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/api/users/wishlist/remove', { propertyId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getUserAppointments = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/api/appointments/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.appointments || [];
};

export const cancelAppointment = async (appointmentId, reason) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/api/appointments/cancel/${appointmentId}`, { reason }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;