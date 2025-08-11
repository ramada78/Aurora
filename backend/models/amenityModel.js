import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  }
});

const Amenity = mongoose.model("Amenity", amenitySchema);

export default Amenity; 