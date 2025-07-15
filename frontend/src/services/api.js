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

export default api;