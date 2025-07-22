import Seller from '../models/Seller.js';

export const listSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate('user_id');
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSeller = async (req, res) => {
  try {
    const { user_id } = req.body;
    const seller = new Seller({ user_id });
    await seller.save();
    res.status(201).json({ success: true, seller });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const seller = await Seller.findByIdAndUpdate(id, { user_id }, { new: true });
    if (!seller) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, seller });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByIdAndDelete(id);
    if (!seller) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; 