import City from '../models/City.js';

// Helper function to get city name based on language
const getCityName = (city, language = 'en') => {
  if (city.city_name && city.city_name[language]) {
    return city.city_name[language];
  }
  // Fallback to English if translation not available
  return city.city_name?.en || city.city_name || 'Unknown';
};

// Helper function to get country name based on language
const getCountryName = (city, language = 'en') => {
  if (city.country && city.country[language]) {
    return city.country[language];
  }
  // Fallback to English if translation not available
  return city.country?.en || city.country || 'Unknown';
};

export const listCities = async (req, res) => {
  try {
    const { lang = 'en' } = req.query; // Get language from query parameter
    const cities = await City.find().sort({ 'city_name.en': 1 });
    
    // Transform cities to include the appropriate names for the requested language
    const transformedCities = cities.map(city => ({
      ...city.toObject(),
      displayCityName: getCityName(city, lang),
      displayCountryName: getCountryName(city, lang)
    }));
    
    res.json({ success: true, cities: transformedCities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCity = async (req, res) => {
  try {
    const { cityNameEn, cityNameAr, countryEn, countryAr } = req.body;
    
    if (!cityNameEn || !cityNameEn.trim() || !cityNameAr || !cityNameAr.trim() || 
        !countryEn || !countryEn.trim() || !countryAr || !countryAr.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both English and Arabic names for city and country are required' 
      });
    }

    // Check if city already exists (check both languages)
    const existingCity = await City.findOne({
      $or: [
        { 'city_name.en': cityNameEn.trim() },
        { 'city_name.ar': cityNameAr.trim() }
      ]
    });
    
    if (existingCity) {
      return res.status(400).json({ 
        success: false, 
        message: 'City already exists' 
      });
    }

    const city = new City({
      city_name: {
        en: cityNameEn.trim(),
        ar: cityNameAr.trim()
      },
      country: {
        en: countryEn.trim(),
        ar: countryAr.trim()
      }
    });
    await city.save();
    res.status(201).json({ success: true, city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityNameEn, cityNameAr, countryEn, countryAr } = req.body;
    
    if (!cityNameEn || !cityNameEn.trim() || !cityNameAr || !cityNameAr.trim() || 
        !countryEn || !countryEn.trim() || !countryAr || !countryAr.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both English and Arabic names for city and country are required' 
      });
    }

    // Check if city already exists (excluding current city)
    const existingCity = await City.findOne({
      _id: { $ne: id },
      $or: [
        { 'city_name.en': cityNameEn.trim() },
        { 'city_name.ar': cityNameAr.trim() }
      ]
    });
    
    if (existingCity) {
      return res.status(400).json({ 
        success: false, 
        message: 'City already exists' 
      });
    }

    const city = await City.findByIdAndUpdate(
      id, 
      {
        city_name: {
          en: cityNameEn.trim(),
          ar: cityNameAr.trim()
        },
        country: {
          en: countryEn.trim(),
          ar: countryAr.trim()
        }
      }, 
      { new: true }
    );
    
    if (!city) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndDelete(id);
    if (!city) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; 