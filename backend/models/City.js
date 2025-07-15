import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  city_name: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  region: { type: String, required: true }
});

const City = mongoose.model("City", citySchema);

export default City; 