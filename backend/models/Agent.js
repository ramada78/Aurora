import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  agencyName: { type: String, required: true },
  yearsOfExperience: { type: Number, required: false },
  specialization: { type: String, required: false },
  licenseNumber: { type: String, required: true },
  verifiedIdentity: { type: Boolean, required: false }
});

const Agent = mongoose.model("Agent", agentSchema);

export default Agent; 