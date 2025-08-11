import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from '../App';
import { Upload, X } from 'lucide-react';

const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = ['Lake View', 'Fireplace', 'Central heating and air conditioning', 'Dock', 'Pool', 'Garage', 'Garden', 'Gym', 'Security system', 'Master bathroom', 'Guest bathroom', 'Home theater', 'Exercise room/gym', 'Covered parking', 'High-speed internet ready'];

const Add = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    propertyType: '',
    city: '',
    seller: '',
    agent: '',
    price: '',
    mapUrl: '',
    descriptionEn: '',
    descriptionAr: '',
    beds: '',
    baths: '',
    sqft: '',
    availability: '',
    amenities: [],
    images: [],
    status: 'available',
    vrTourLink: '',
  });

  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [allAmenities, setAllAmenities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    axios.get(`${backendurl}/api/products/amenities?lang=${i18n.language}`).then(res => {
      if (res.data.success) setAllAmenities(res.data.amenities);
    });
    axios.get(`${backendurl}/api/property-types?lang=${i18n.language}`).then(res => {
      if (res.data.success) setPropertyTypes(res.data.types);
    });
    axios.get(`${backendurl}/api/cities?lang=${i18n.language}`).then(res => {
      if (res.data.success) setCities(res.data.cities);
    });
    axios.get(`${backendurl}/api/sellers`).then(res => {
      if (res.data.success) setSellers(res.data.sellers);
    });
    axios.get(`${backendurl}/api/agents`).then(res => {
      if (res.data.success) setAgents(res.data.agents);
    });
  }, [i18n.language]);

  // Auto-fill agent if logged-in user is agent, after agents are loaded
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    if (user && user._id && Array.isArray(roles) && roles.includes('agent')) {
      // Find the Agent document for this user
      const agentDoc = agents.find(a =>
        String(a.user_id?._id) === String(user._id)
      );
      if (agentDoc) {
        setFormData(prev => ({ ...prev, agent: String(user._id) }));
      }
    }
  }, [agents]);

  // Auto-fill seller if logged-in user is seller, after sellers are loaded
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    if (user && user._id && Array.isArray(roles) && roles.includes('seller')) {
      // Find the Seller document for this user
      const sellerDoc = sellers.find(s =>
        String(s.user_id?._id) === String(user._id)
      );
      if (sellerDoc) {
        setFormData(prev => ({ ...prev, seller: String(user._id) }));
      }
    }
  }, [sellers]);


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
      alert(t('forms.imageUpload.maxImages'));
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
      formdata.append('titleEn', formData.titleEn);
      formdata.append('titleAr', formData.titleAr);
      formdata.append('propertyType', formData.propertyType);
      formdata.append('city', formData.city);
      if (formData.seller) {
        formdata.append('seller', formData.seller);
      }
      if (formData.agent) {
        formdata.append('agent', formData.agent);
      }
      formdata.append('price', formData.price);
      formdata.append('mapUrl', formData.mapUrl);
      formdata.append('descriptionEn', formData.descriptionEn);
      formdata.append('descriptionAr', formData.descriptionAr);
      formdata.append('beds', formData.beds);
      formdata.append('baths', formData.baths);
      formdata.append('sqft', formData.sqft);
      formdata.append('availability', formData.availability);
      formdata.append('status', formData.status);
      formdata.append('vrTourLink', formData.vrTourLink);
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
          titleEn: '',
          titleAr: '',
          propertyType: '',
          city: '',
          seller: '',
          agent: '',
          price: '',
          mapUrl: '',
          descriptionEn: '',
          descriptionAr: '',
          beds: '',
          baths: '',
          sqft: '',
          availability: '',
          amenities: [],
          images: [],
          status: 'available',
          vrTourLink: '',
        });
        setPreviewUrls([]);
        toast.success(t('forms.addProperty.success'));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(t('forms.addProperty.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto rounded-2xl shadow-2xl bg-white/90 backdrop-blur-sm p-8 border border-white/20">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">{t('forms.addProperty.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="titleEn" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.titleEn')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titleEn"
                name="titleEn"
                required
                value={formData.titleEn}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                placeholder={t('forms.placeholders.enterTitleEn')}
              />
            </div>
            <div>
              <label htmlFor="titleAr" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.titleAr')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titleAr"
                name="titleAr"
                required
                value={formData.titleAr}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                placeholder={t('forms.placeholders.enterTitleAr')}
              />
            </div>
            <div>
              <label htmlFor="descriptionEn" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.descriptionEn')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                required
                value={formData.descriptionEn}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                placeholder={t('forms.placeholders.enterDescriptionEn')}
              />
            </div>
            <div>
              <label htmlFor="descriptionAr" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.descriptionAr')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descriptionAr"
                name="descriptionAr"
                required
                value={formData.descriptionAr}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                placeholder={t('forms.placeholders.enterDescriptionAr')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.propertyType')}
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  required
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                >
                  <option value="">{t('forms.placeholders.selectType')}</option>
                  {propertyTypes.map(type => (
                    <option key={type._id} value={type._id}>{i18n.language === 'ar' ? type.type_name?.ar : type.type_name?.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.city')}
                </label>
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                >
                  <option value="">{t('forms.placeholders.selectCity')}</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>{i18n.language === 'ar' ? city.city_name?.ar : city.city_name?.en}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="seller" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.seller')}
                </label>
                <select
                  id="seller"
                  name="seller"
                  value={formData.seller}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                >
                  <option value="">{t('forms.placeholders.selectSeller')}</option>
                  {sellers.map(seller => (
                    <option key={seller._id} value={seller.user_id?._id}>{seller.user_id?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="agent" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.agent')}
                </label>
                <select
                  id="agent"
                  name="agent"
                  value={formData.agent || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                >
                  <option value="">{t('forms.placeholders.selectAgent')}</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent.user_id?._id}>{agent.user_id?.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.availability')}
              </label>
              <select
                id="availability"
                name="availability"
                required
                value={formData.availability}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
              >
                <option value="">{t('forms.placeholders.selectAvailability')}</option>
                {AVAILABILITY_TYPES.map(type => (
                  <option key={type} value={type}>{t(`forms.availability.${type}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.status')}
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
              >
                <option value="available">{t('properties.status.available')}</option>
                <option value="rented">{t('properties.status.rented')}</option>
                <option value="sold">{t('properties.status.sold')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.mapUrl')}
              </label>
              <input
                type="text"
                id="mapUrl"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                placeholder={t('forms.placeholders.mapUrlPlaceholder')}
                className="mt-1 block w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="vrTourLink" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.vrTourLink')}
              </label>
              <input
                type="text"
                id="vrTourLink"
                name="vrTourLink"
                value={formData.vrTourLink}
                onChange={handleInputChange}
                placeholder={t('forms.placeholders.vrTourPlaceholder')}
                className="mt-1 block w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 transition-all duration-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.price')}
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.beds')}
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  required
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                />
              </div>
              <div>
                <label htmlFor="baths" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.baths')}
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  required
                  min="0"
                  value={formData.baths}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                />
              </div>
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                  {t('forms.fields.sqft')}
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  required
                  min="0"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 transition-all duration-300"
                />
              </div>
            </div>
            {/* Remove phone number field from the form */}
          </div>
          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('forms.fields.amenities')}
            </label>
            <div className="flex flex-wrap gap-2">
              {allAmenities.map(amenity => (
                <button
                  key={amenity._id}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity._id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    formData.amenities.includes(amenity._id)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                  }`}
                >
                  {i18n.language === 'ar' ? amenity.name?.ar : amenity.name?.en}
                </button>
              ))}
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('forms.fields.images')}
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={url} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
            {previewUrls.length < 4 && (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-all duration-300">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-all duration-300">
                      <span>{t('forms.imageUpload.uploadImages')}</span>
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
                  <p className="text-xs text-gray-500">{t('forms.imageUpload.fileTypes')}</p>
                </div>
              </div>
            )}
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? t('forms.addProperty.submitting') : t('forms.addProperty.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;