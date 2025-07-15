import PropertyType from '../models/PropertyType.js';

export const listPropertyTypes = async (req, res) => {
  try {
    const types = await PropertyType.find();
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPropertyType = async (req, res) => {
  try {
    const { type_name, category } = req.body;
    const type = new PropertyType({ type_name, category });
    await type.save();
    res.status(201).json({ success: true, type });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name, category } = req.body;
    const type = await PropertyType.findByIdAndUpdate(id, { type_name, category }, { new: true });
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