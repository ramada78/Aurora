import Client from '../models/Client.js';

export const listClients = async (req, res) => {
  try {
    const clients = await Client.find().populate('user_id');
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addClient = async (req, res) => {
  try {
    const { user_id } = req.body;
    const client = new Client({ user_id });
    await client.save();
    res.status(201).json({ success: true, client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const client = await Client.findByIdAndUpdate(id, { user_id }, { new: true });
    if (!client) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, client });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; 