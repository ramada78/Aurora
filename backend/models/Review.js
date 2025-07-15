import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review; 