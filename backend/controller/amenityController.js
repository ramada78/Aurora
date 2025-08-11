import Amenity from '../models/amenityModel.js';

// Helper function to get amenity name based on language
const getAmenityName = (amenity, language = 'en') => {
  if (amenity.name && amenity.name[language]) {
    return amenity.name[language];
  }
  // Fallback to English if translation not available
  return amenity.name?.en || amenity.name || 'Unknown';
};

export const listAmenities = async (req, res) => {
  try {
    const { lang = 'en' } = req.query; // Get language from query parameter
    const amenities = await Amenity.find().sort({ 'name.en': 1 });
    
    // Transform amenities to include the appropriate name for the requested language
    const transformedAmenities = amenities.map(amenity => ({
      ...amenity.toObject(),
      displayName: getAmenityName(amenity, lang)
    }));
    
    res.json({ success: true, amenities: transformedAmenities });
  } catch (error) {
    console.error('Error listing amenities:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAmenity = async (req, res) => {
  try {
    const { nameEn, nameAr } = req.body;
    
    if (!nameEn || !nameEn.trim() || !nameAr || !nameAr.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both English and Arabic names are required' 
      });
    }

    // Check if amenity already exists (check both languages)
    const existingAmenity = await Amenity.findOne({
      $or: [
        { 'name.en': nameEn.trim() },
        { 'name.ar': nameAr.trim() }
      ]
    });
    
    if (existingAmenity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amenity already exists' 
      });
    }

    const amenity = new Amenity({
      name: {
        en: nameEn.trim(),
        ar: nameAr.trim()
      }
    });
    await amenity.save();
    
    res.status(201).json({ success: true, amenity });
  } catch (error) {
    console.error('Error adding amenity:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameEn, nameAr } = req.body;
    
    if (!nameEn || !nameEn.trim() || !nameAr || !nameAr.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both English and Arabic names are required' 
      });
    }

    // Check if amenity already exists (excluding current amenity)
    const existingAmenity = await Amenity.findOne({
      _id: { $ne: id },
      $or: [
        { 'name.en': nameEn.trim() },
        { 'name.ar': nameAr.trim() }
      ]
    });
    
    if (existingAmenity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amenity already exists' 
      });
    }

    const amenity = await Amenity.findByIdAndUpdate(
      id,
      {
        name: {
          en: nameEn.trim(),
          ar: nameAr.trim()
        }
      },
      { new: true }
    );
    
    if (!amenity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Amenity not found' 
      });
    }
    
    res.json({ success: true, amenity });
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await Amenity.findByIdAndDelete(id);
    
    if (!amenity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Amenity not found' 
      });
    }
    
    res.json({ success: true, message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const amenity = await Amenity.findById(id);
    
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }
    
    res.json({ success: true, amenity });
  } catch (error) {
    console.error('Error fetching amenity:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}; 