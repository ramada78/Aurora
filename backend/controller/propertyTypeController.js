import PropertyType from '../models/PropertyType.js';
import Property from '../models/propertymodel.js';

// Helper function to get property type name based on language
const getPropertyTypeName = (propertyType, language = 'en') => {
  if (propertyType.type_name && propertyType.type_name[language]) {
    return propertyType.type_name[language];
  }
  // Fallback to English if translation not available
  return propertyType.type_name?.en || propertyType.type_name || 'Unknown';
};

export const listPropertyTypes = async (req, res) => {
  try {
    const { lang = 'en' } = req.query; // Get language from query parameter
    const types = await PropertyType.find().sort({ 'type_name.en': 1 });
    
    // Transform property types to include the appropriate name for the requested language
    const transformedTypes = types.map(type => ({
      ...type.toObject(),
      displayName: getPropertyTypeName(type, lang)
    }));
    
    res.json({ success: true, types: transformedTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPropertyType = async (req, res) => {
  try {
    const { typeNameEn, typeNameAr, category } = req.body;
    
    if (!typeNameEn || !typeNameEn.trim() || !typeNameAr || !typeNameAr.trim() || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both English and Arabic names are required, along with category' 
      });
    }

    // Check if property type already exists (check both languages)
    const existingType = await PropertyType.findOne({
      $or: [
        { 'type_name.en': typeNameEn.trim() },
        { 'type_name.ar': typeNameAr.trim() }
      ]
    });
    
    if (existingType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property type already exists' 
      });
    }

    const type = new PropertyType({
      type_name: {
        en: typeNameEn.trim(),
        ar: typeNameAr.trim()
      },
      category
    });
    await type.save();
    res.status(201).json({ success: true, type });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { typeNameEn, typeNameAr, category } = req.body;
    
    if (!typeNameEn || !typeNameEn.trim() || !typeNameAr || !typeNameAr.trim() || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both English and Arabic names are required, along with category' 
      });
    }

    // Check if property type already exists (excluding current type)
    const existingType = await PropertyType.findOne({
      _id: { $ne: id },
      $or: [
        { 'type_name.en': typeNameEn.trim() },
        { 'type_name.ar': typeNameAr.trim() }
      ]
    });
    
    if (existingType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property type already exists' 
      });
    }

    const type = await PropertyType.findByIdAndUpdate(
      id, 
      {
        type_name: {
          en: typeNameEn.trim(),
          ar: typeNameAr.trim()
        },
        category
      }, 
      { new: true }
    );
    
    if (!type) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, type });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await PropertyType.findByIdAndDelete(id);
    if (!type) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// New: Get property type counts
export const getPropertyTypeCounts = async (req, res) => {
  try {
    // Aggregate property counts by propertyType
    const counts = await Property.aggregate([
      { $group: { _id: "$propertyType", count: { $sum: 1 } } }
    ]);
    // Join with PropertyType to get names
    const types = await PropertyType.find();
    const result = counts.map(c => {
      const type = types.find(t => t._id.toString() === (c._id ? c._id.toString() : ''));
      return type ? {
        _id: type._id,
        type_name: type.type_name,
        category: type.category,
        count: c.count
      } : null;
    }).filter(Boolean);
    res.json({ success: true, types: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 