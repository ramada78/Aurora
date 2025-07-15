import Amenity from '../models/amenityModel.js';

export const listAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find().sort({ name: 1 });
    res.json({ success: true, amenities });
  } catch (error) {
    console.error('Error listing amenities:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAmenity = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Amenity name is required' });
    }

    // Check if amenity already exists
    const existingAmenity = await Amenity.findOne({ name: name.trim() });
    if (existingAmenity) {
      return res.status(400).json({ success: false, message: 'Amenity already exists' });
    }

    const amenity = new Amenity({ name: name.trim() });
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
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Amenity name is required' });
    }

    // Check if amenity already exists with the new name
    const existingAmenity = await Amenity.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existingAmenity) {
      return res.status(400).json({ success: false, message: 'Amenity name already exists' });
    }

    const amenity = await Amenity.findByIdAndUpdate(
      id, 
      { name: name.trim() }, 
      { new: true }
    );
    
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
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
      return res.status(404).json({ success: false, message: 'Amenity not found' });
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