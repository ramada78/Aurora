import React, { useEffect, useState } from 'react';
import { getWishlist } from '../services/api';
import PropertyCard from '../components/properties/Propertycard';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SavedProperties = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const data = await getWishlist();
        setWishlist(data);
        setError(null);
      } catch (err) {
        setError(t('savedProperties.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [t]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
        {isRTL ? (
          <>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow">{t('savedProperties.title')}</h2>
          <Heart className="w-8 h-8 text-blue-500 ml-2" />
        </>
        ) : (
          <>
          <Heart className="w-8 h-8 text-blue-500 ml-2" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow">{t('savedProperties.title')}</h2>
        </>
        )}
      </div>
      {loading ? (
        <div className="text-center">{t('savedProperties.loading')}</div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="text-gray-600 text-center">{t('savedProperties.noProperties')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlist.map(property => (
            <PropertyCard
              key={property._id}
              property={property}
              viewType="grid"
              propertyTypeName={isRTL ? property.propertyType?.type_name_ar : property.propertyType?.type_name}
              cityName={isRTL ? property.city?.city_name_ar : property.city?.city_name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProperties; 