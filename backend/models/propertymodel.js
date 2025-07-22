import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: { 
    type: [String],
    required: true
 },
  beds: {
    type: Number,
    required: true,
  },
  baths: {
    type: Number,
    required: true,
  },
  sqft: {
    type: Number,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amenities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Amenity",
    required: true
  }],
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  propertyType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyType',
    required: false // for backward compatibility
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: false // for backward compatibility
  },
  mapUrl: {
    type: String,
    required: false,
    default: ""
  },
  views: {
    type: Number,
    default: 0
  },
  status: { type: String, enum: ['available', 'rented', 'sold'], default: 'available' },
  vrTourLink: { type: String, required: false, default: '' },
}, {
  timestamps: true
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
