import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  city_name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  country: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  }
});

const City = mongoose.model("City", citySchema);

export default City; 