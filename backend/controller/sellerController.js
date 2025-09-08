import Seller from '../models/Seller.js';

export const listSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().populate({
      path: 'user_id',
      select: 'name email _id'
    });
    console.log('Sellers found:', sellers.length);
    console.log('Sellers data:', sellers.map(s => ({ 
      id: s._id, 
      userId: s.user_id?._id, 
      userName: s.user_id?.name 
    })));
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSeller = async (req, res) => {
  try {
    const { user_id, idNumber, verifiedIdentity } = req.body;
    const seller = new Seller({ 
      user_id, 
      idNumber, 
      verifiedIdentity 
    });
    await seller.save();
    res.status(201).json({ success: true, seller });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, idNumber, verifiedIdentity } = req.body;
    const updateData = { user_id };
    
    if (idNumber !== undefined) updateData.idNumber = idNumber;
    if (verifiedIdentity !== undefined) updateData.verifiedIdentity = verifiedIdentity;
    
    const seller = await Seller.findByIdAndUpdate(id, updateData, { new: true });
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