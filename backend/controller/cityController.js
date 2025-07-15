import City from '../models/City.js';

export const listCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json({ success: true, cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCity = async (req, res) => {
  try {
    const { city_name, country, region } = req.body;
    const city = new City({ city_name, country, region });
    await city.save();
    res.status(201).json({ success: true, city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_name, country, region } = req.body;
    const city = await City.findByIdAndUpdate(id, { city_name, country, region }, { new: true });
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