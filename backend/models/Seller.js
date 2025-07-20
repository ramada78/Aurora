import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller; 