import mongoose from "mongoose";

const propertyTypeSchema = new mongoose.Schema({
  type_name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  category: { type: String, enum: ['Residential', 'Commercial', 'Land', 'Industrial'], required: true }
});

const PropertyType = mongoose.model("PropertyType", propertyTypeSchema);

export default PropertyType; 