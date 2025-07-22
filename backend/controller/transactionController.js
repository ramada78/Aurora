import Transaction from '../models/Transaction.js';
import Property from '../models/propertymodel.js';
import Agent from '../models/Agent.js';
import Seller from '../models/Seller.js';

// --- Utility: Get Agent/Seller doc for current user ---
async function getMyAgentId(user) {
  if (!user || !user._id) return null;
  const agentDoc = await Agent.findOne({ user_id: user._id });
  return agentDoc ? String(agentDoc._id) : null;
}
async function getMySellerId(user) {
  if (!user || !user._id) return null;
  const sellerDoc = await Seller.findOne({ user_id: user._id });
  return sellerDoc ? String(sellerDoc._id) : null;
}

function isAllowedTransaction({ req, property, action }) {
  console.log('Permission check:', {
    userId: req.user && req.user._id,
    propertyAgent: property.agent,
    propertySeller: property.seller,
    isAdmin: req.admin,
    action
  });
  if (action === 'add') return true;
  if (req.admin) return true;
  if (!req.user || !req.user._id) return false;
  if (property.agent && property.agent.toString() === req.user._id.toString()) return true;
  if (property.seller && property.seller.toString() === req.user._id.toString()) return true;
  return false;
}

// Utility function to robustly extract an _id
function getId(v) {
  return v && typeof v === 'object' && v._id ? v._id : v;
}

export const listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('property_id')
      .populate('seller_id', 'name email')
      .populate('buyer_id')
      .populate('agent_id', 'name email');
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { transaction_date, sale_price, status, deal_type, property_id, seller_id, buyer_id, agent_id } = req.body;
    const property = await Property.findById(property_id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    // Debug logging
    console.log('property:', property);
    console.log('property.seller:', property.seller);
    console.log('property.agent:', property.agent);
    // Authorization
    if (!isAllowedTransaction({ req, property, action: 'add' })) {
      return res.status(403).json({ success: false, message: 'You do not have permission to add a transaction for this property.' });
    }
    // Use getId to support both populated and unpopulated refs
    const finalSellerId = seller_id || getId(property.seller);
    const finalAgentId = agent_id || getId(property.agent) || undefined;
    // Defensive checks for required fields
    if (!finalSellerId) {
      console.error('Missing seller_id');
      return res.status(400).json({ success: false, message: 'Missing seller_id' });
    }
    if (!buyer_id) {
      console.error('Missing buyer_id');
      return res.status(400).json({ success: false, message: 'Missing buyer_id' });
    }
    if (!property_id) {
      console.error('Missing property_id');
      return res.status(400).json({ success: false, message: 'Missing property_id' });
    }
    // Log the transaction object before saving
    console.log('Transaction to save:', {
      transaction_date,
      sale_price,
      status,
      deal_type,
      property_id,
      seller_id: finalSellerId,
      buyer_id,
      agent_id: finalAgentId,
    });
    const transaction = new Transaction({
      transaction_date,
      sale_price,
      status,
      deal_type,
      property_id,
      seller_id: finalSellerId,
      buyer_id,
      agent_id: finalAgentId,
    });
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
    console.error('Add Transaction Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_date, sale_price, status, deal_type, property_id, seller_id, buyer_id, agent_id } = req.body;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    const property = await Property.findById(property_id || transaction.property_id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    // Authorization
    if (!isAllowedTransaction({ req, property, action: 'edit' })) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this transaction.' });
    }
    transaction.transaction_date = transaction_date;
    transaction.sale_price = sale_price;
    transaction.status = status;
    transaction.deal_type = deal_type;
    transaction.property_id = property_id;
    transaction.seller_id = seller_id;
    transaction.buyer_id = buyer_id;
    transaction.agent_id = agent_id;
    await transaction.save();
    // Update property status if transaction is completed
    if (status === 'completed' && transaction.property_id && deal_type) {
      if (deal_type === 'rent') {
        await Property.findByIdAndUpdate(transaction.property_id, { status: 'rented' });
      } else if (deal_type === 'sale') {
        await Property.findByIdAndUpdate(transaction.property_id, { status: 'sold' });
      }
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    const property = await Property.findById(transaction.property_id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    // Authorization
    if (!isAllowedTransaction({ req, property, action: 'delete' })) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this transaction.' });
    }
    await transaction.deleteOne();
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