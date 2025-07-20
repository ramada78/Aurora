import React, { useEffect, useState } from 'react';
import { getWishlist } from '../services/api';
import PropertyCard from '../components/properties/Propertycard';
import { Heart } from 'lucide-react';

const SavedProperties = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const data = await getWishlist();
        setWishlist(data);
        setError(null);
      } catch (err) {
        setError('Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-blue-500" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow">Saved Properties</h2>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="text-gray-600">You have no saved properties yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlist.map(property => (
            <PropertyCard
              key={property._id}
              property={property}
              viewType="grid"
              propertyTypeName={property.propertyType?.type_name}
              cityName={property.city?.city_name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProperties; 