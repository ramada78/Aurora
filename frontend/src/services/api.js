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

export default api;