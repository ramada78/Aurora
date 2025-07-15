import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String }
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller; 