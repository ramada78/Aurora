import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
});

const Agent = mongoose.model("Agent", agentSchema);

export default Agent; 