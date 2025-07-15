import Transaction from '../models/Transaction.js';
import Property from '../models/propertymodel.js';

export const listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('property_id seller_id buyer_id');
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { transaction_date, sale_price, status, deal_type, property_id, seller_id, buyer_id, agent_id } = req.body;
    const transaction = new Transaction({ transaction_date, sale_price, status, deal_type, property_id, seller_id, buyer_id, agent_id });
    await transaction.save();
    // Update property status if transaction is completed
    if (status === 'completed') {
      if (deal_type === 'rent') {
        await Property.findByIdAndUpdate(property_id, { status: 'rented' });
      } else if (deal_type === 'sale') {
        await Property.findByIdAndUpdate(property_id, { status: 'sold' });
      }
    }
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_date, sale_price, status, deal_type, property_id, seller_id, buyer_id, agent_id } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { transaction_date, sale_price, status, deal_type, property_id, seller_id, buyer_id, agent_id },
      { new: true }
    );
    // Update property status if transaction is completed
    if (status === 'completed' && property_id && deal_type) {
      if (deal_type === 'rent') {
        await Property.findByIdAndUpdate(property_id, { status: 'rented' });
      } else if (deal_type === 'sale') {
        await Property.findByIdAndUpdate(property_id, { status: 'sold' });
      }
    }
    if (!transaction) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const countCompletedTransactions = async (req, res) => {
  try {
    const count = await Transaction.countDocuments({ status: 'completed' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 