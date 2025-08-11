import { Home, DollarSign, Filter, MapPin, HousePlus, SparkleIcon, Check, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nHelpers';


const FilterSection = ({ filters, setFilters, onApplyFilters, onNumericBlur, onNonNumericChange, amenities = [], propertyTypes = [], cities = [] }) => {
  const { t, i18n } = useTranslation();
  

  const handleChange = (e) => {
    let name, value;
    if (e && e.target) {
      ({ name, value } = e.target);
    } else if (e && typeof e === 'object') {
      ({ name, value } = e);
    }
    setFilters(prev => {
      const updated = { ...prev, [name]: value };
      onApplyFilters && onApplyFilters(updated);
      return updated;
    });
  };

  const handleAmenityCheckbox = (amenityId) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        amenities: prev.amenities.includes(amenityId)
          ? prev.amenities.filter(a => a !== amenityId)
          : [...prev.amenities, amenityId]
      };
      onApplyFilters && onApplyFilters(updated);
      return updated;
    });
    onNonNumericChange && onNonNumericChange({ ...filters, amenities: filters.amenities.includes(amenityId)
      ? filters.amenities.filter(a => a !== amenityId)
      : [...filters.amenities, amenityId] });
  };

  const handleButtonChange = (field, value) => {
    setFilters(prev => {
      const updated = { ...prev, [field]: value };
      onApplyFilters && onApplyFilters(updated);
      return updated;
    });
    onNonNumericChange && onNonNumericChange();
  };

  const handleReset = () => {
    const resetFilters = {
      ...filters,
      minPrice: '',
      maxPrice: '',
      propertyType: "",
      bedrooms: "0",
      bathrooms: "0",
      area: "",
      availability: "",
      city: "",
      searchQuery: "",
      sortBy: "",
      status: "",
      amenities: []
    };
    setFilters(resetFilters);
    onApplyFilters && onApplyFilters(resetFilters);
  };


  const availabilityTypes = ["buy", "rent"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">{t('filters') || 'Filters'}</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {t('reset_all') || 'Reset All'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Property Status Filter - toggle below label */}
        <div className="filter-group flex flex-col gap-1 items-start">
          <label className="filter-label font-bold text-blue-700 text-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t('show_available_only')}
          </label>
          <button
            type="button"
            aria-pressed={filters.status === 'available'}
            onClick={() => { handleButtonChange('status', filters.status === 'available' ? '' : 'available'); onNonNumericChange && onNonNumericChange({ ...filters, status: filters.status === 'available' ? '' : 'available' }); }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none border-2 border-blue-500 mt-1 ${filters.status === 'available' ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
              style={{
                transform: filters.status === 'available' 
                  ? (i18n.dir() === 'rtl' ? 'translateX(-1.8rem)' : 'translateX(1.8rem)')
                  : (i18n.dir() === 'rtl' ? 'translateX(-0.25rem)' : 'translateX(0.25rem)')
              }}
            />
          </button>
        </div>

        {/* Availability Type */}
        <div className="filter-group">
          <label className="filter-label font-medium flex items-center gap-2"> <HousePlus className="w-4 h-4"/>{t('listing_type')}</label>
          <div className="flex gap-2 mt-2 flex-nowrap w-full overflow-x-auto">
            {availabilityTypes.map(type => (
              <button
                key={type}
                onClick={() => { handleButtonChange('availability', type); onNonNumericChange && onNonNumericChange({ ...filters, availability: type }); }}
                className={`min-w-[110px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.availability === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div className="filter-group">
          <label className="filter-label font-medium flex items-center gap-2">
            <Home className="w-4 h-4" />
            {t('property_type')}
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {propertyTypes.map((type) => {
              const typeName = getLocalizedText(type.type_name);
              return (
                <button
                  key={type._id}
                  onClick={() => { handleButtonChange('propertyType', typeName); onNonNumericChange && onNonNumericChange({ ...filters, propertyType: typeName }); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.propertyType === typeName ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {typeName}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Filter */}
        <div className="filter-group">
          <label className="filter-label font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/>{t('city')}</label>
          <select
            name="city"
            value={filters.city}
            onChange={e => {
              handleChange(e);
              onNonNumericChange && onNonNumericChange({ ...filters, city: e.target.value });
            }}
            className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('all_cities') || 'All Cities'}</option>
            {cities.map(city => {
              const cityName = getLocalizedText(city.city_name);
              return (
                <option key={city._id} value={cityName}>{cityName}</option>
              );
            })}
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-group mt-4">
          <label className="filter-label font-medium flex items-center gap-2"><DollarSign className="w-4 h-4"/>{t('price_range_usd')}</label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="number"
              min={0}
              name="minPrice"
              value={filters.minPrice !== undefined && filters.minPrice !== '' ? filters.minPrice : ''}
              onChange={e => handleChange({ name: 'minPrice', value: e.target.value === '' ? '' : Number(e.target.value) })}
              onBlur={() => onNumericBlur && onNumericBlur()}
              className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('min_placeholder')}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min={0}
              name="maxPrice"
              value={filters.maxPrice !== undefined && filters.maxPrice !== '' ? filters.maxPrice : ''}
              onChange={e => handleChange({ name: 'maxPrice', value: e.target.value === '' ? '' : Number(e.target.value) })}
              onBlur={() => onNumericBlur && onNumericBlur()}
              className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('max_placeholder')}
            />
          </div>
        </div>

        {/* Bedrooms, Bathrooms, Area */}
        <div className="filter-group">
          <div className="flex flex-row gap-3 w-full">
            <div className="flex-1 min-w-[80px]">
              <label className="filter-label font-medium">{t('bedrooms')}</label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                value={filters.bedrooms}
                onChange={handleChange}
                onBlur={() => onNumericBlur && onNumericBlur()}
                className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('any_placeholder')}
              />
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="filter-label font-medium">{t('bathrooms')}</label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                value={filters.bathrooms}
                onChange={handleChange}
                onBlur={() => onNumericBlur && onNumericBlur()}
                className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('any_placeholder')}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="filter-label font-medium">{t('area_sqft')}</label>
            <input
              type="number"
              name="area"
              min="0"
              value={filters.area || ''}
              onChange={handleChange}
              onBlur={() => onNumericBlur && onNumericBlur()}
              className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any"
            />
          </div>
        </div>

        {/* Amenities Filter */}
        {amenities.length > 0 && (
          <div className="filter-group">
            <label className="filter-label flex items-center gap-2"><SparkleIcon className="w-4 h-4"/>{t('amenities')}</label>
            <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto pr-2">
              {amenities.map(amenity => {
                const amenityName = getLocalizedText(amenity.name);
                return (
                  <label key={amenity._id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity._id)}
                      onChange={() => handleAmenityCheckbox(amenity._id)}
                      className="accent-blue-600 h-4 w-4 rounded border-gray-300"
                    />
                    <span>{amenityName}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default FilterSection;