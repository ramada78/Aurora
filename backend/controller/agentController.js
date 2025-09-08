import Agent from '../models/Agent.js';

export const listAgents = async (req, res) => {
  try {
    const agents = await Agent.find().populate({
      path: 'user_id',
      select: 'name email _id'
    });
    console.log('Agents found:', agents.length);
    console.log('Agents data:', agents.map(a => ({ 
      id: a._id, 
      userId: a.user_id?._id, 
      userName: a.user_id?.name 
    })));
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAgent = async (req, res) => {
  try {
    const { user_id, agencyName, yearsOfExperience, specialization, licenseNumber, verifiedIdentity } = req.body;
    
    // Validate required fields
    if (!agencyName || !licenseNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Agency Name and License Number are required" 
      });
    }
    
    const agent = new Agent({ 
      user_id, 
      agencyName, 
      yearsOfExperience, 
      specialization, 
      licenseNumber,
      verifiedIdentity: verifiedIdentity || false
    });
    await agent.save();
    res.status(201).json({ success: true, agent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, agencyName, yearsOfExperience, specialization, licenseNumber, verifiedIdentity } = req.body;
    const updateData = { user_id };
    
    if (agencyName !== undefined) updateData.agencyName = agencyName;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (verifiedIdentity !== undefined) updateData.verifiedIdentity = verifiedIdentity;
    
    const agent = await Agent.findByIdAndUpdate(id, updateData, { new: true });
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