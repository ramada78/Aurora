import Agent from '../models/Agent.js';

export const listAgents = async (req, res) => {
  try {
    const agents = await Agent.find().populate('user_id');
    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAgent = async (req, res) => {
  try {
    const { user_id } = req.body;
    const agent = new Agent({ user_id });
    await agent.save();
    res.status(201).json({ success: true, agent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const agent = await Agent.findByIdAndUpdate(id, { user_id }, { new: true });
    if (!agent) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, agent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findByIdAndDelete(id);
    if (!agent) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; 