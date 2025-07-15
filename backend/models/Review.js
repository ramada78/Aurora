import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review; 