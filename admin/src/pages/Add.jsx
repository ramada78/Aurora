import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from '../App';
import { Upload, X } from 'lucide-react';

const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = ['Lake View', 'Fireplace', 'Central heating and air conditioning', 'Dock', 'Pool', 'Garage', 'Garden', 'Gym', 'Security system', 'Master bathroom', 'Guest bathroom', 'Home theater', 'Exercise room/gym', 'Covered parking', 'High-speed internet ready'];

const Add = () => {
  const [formData, setFormData] = useState({
    title: '',
    propertyType: '', // propertyType ID
    city: '', // city ID
    seller: '', // seller ID
    price: '',
    mapUrl: '',
    description: '',
    beds: '',
    baths: '',
    sqft: '',
    availability: '',
    amenities: [], // will store amenity IDs
    images: [],
    status: 'available',
  });

  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [allAmenities, setAllAmenities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    // Fetch amenities, property types, cities, and sellers from backend
    axios.get(`${backendurl}/api/products/amenities`).then(res => {
      if (res.data.success) setAllAmenities(res.data.amenities);
    });
    axios.get(`${backendurl}/api/property-types`).then(res => {
      if (res.data.success) setPropertyTypes(res.data.types);
    });
    axios.get(`${backendurl}/api/cities`).then(res => {
      if (res.data.success) setCities(res.data.cities);
    });
    axios.get(`${backendurl}/api/sellers`).then(res => {
      if (res.data.success) setSellers(res.data.sellers);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewUrls.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity]
      }));
      setNewAmenity('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formdata = new FormData();
      formdata.append('title', formData.title);
      formdata.append('propertyType', formData.propertyType);
      formdata.append('city', formData.city);
      if (formData.seller) {
        formdata.append('seller', formData.seller);
      }
      formdata.append('price', formData.price);
      formdata.append('mapUrl', formData.mapUrl);
      formdata.append('description', formData.description);
      formdata.append('beds', formData.beds);
      formdata.append('baths', formData.baths);
      formdata.append('sqft', formData.sqft);
      formdata.append('availability', formData.availability);
      formdata.append('status', formData.status);
      formData.amenities.forEach((amenityId, index) => {
        formdata.append(`amenities[${index}]`, amenityId);
      });
      formData.images.forEach((image, index) => {
        formdata.append(`image${index + 1}`, image);
      });
      const response = await axios.post(`${backendurl}/api/products/add`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          title: '',
          propertyType: '',
          city: '',
          seller: '',
          price: '',
          mapUrl: '',
          description: '',
          beds: '',
          baths: '',
          sqft: '',
          availability: '',
          amenities: [],
          images: [],
          status: 'available',
        });
        setPreviewUrls([]);
        toast.success('Property added successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Property</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Property Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  required
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map(type => (
                    <option key={type._id} value={type._id}>{type.type_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>{city.city_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="seller" className="block text-sm font-medium text-gray-700">
                  Seller (Optional)
                </label>
                <select
                  id="seller"
                  name="seller"
                  value={formData.seller}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                >
                  <option value="">Select Seller</option>
                  {sellers.map(seller => (
                    <option key={seller._id} value={seller._id}>{seller.full_name || seller.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                >
                  <option value="">Select Availability</option>
                  {AVAILABILITY_TYPES.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-700">
                Map URL
              </label>
              <input
                type="text"
                id="mapUrl"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/..."
                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  required
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                />
              </div>
              <div>
                <label htmlFor="baths" className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  required
                  min="0"
                  value={formData.baths}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                />
              </div>
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                  Square Feet
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  required
                  min="0"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3"
                />
              </div>
            </div>
            {/* Remove phone number field from the form */}
          </div>
          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {allAmenities.map(amenity => (
                <button
                  key={amenity._id}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity._id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    formData.amenities.includes(amenity._id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {amenity.name}
                </button>
              ))}
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={url} alt="Preview" className="w-full h-full object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
            {previewUrls.length < 4 && (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;