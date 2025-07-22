import fs from "fs";
import Property from "../models/propertymodel.js";
import Amenity from "../models/amenityModel.js";
import Agent from '../models/Agent.js';
import Seller from '../models/Seller.js';

const addproperty = async (req, res) => {
    try {
        let { title, price, beds, baths, sqft, propertyType, city, availability, description, amenities, seller, agent, mapUrl, vrTourLink } = req.body;
        if (seller === "") seller = undefined;
        if (agent === "") agent = undefined;
        // Use propertyType if available, otherwise fall back to type
        const propertyTypeValue = propertyType;
        
        // amenities should be an array of Amenity ObjectIds (as strings)
        if (!Array.isArray(amenities)) {
            if (typeof amenities === 'string') {
                amenities = [amenities];
            } else {
                amenities = [];
            }
        }
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        const imageUrls = images.map(item => `/uploads/${item.filename}`);
        // Use agent from body if provided, else fallback to logged-in user if agent, else null
        let agentId = agent;
        if (!agentId && req.user && req.user.roles && req.user.roles.includes('agent')) {
          agentId = req.user._id;
        }
        // seller and agent are now user IDs
        const product = new Property({
            title,
            price,
            beds,
            baths,
            sqft,
            propertyType: propertyTypeValue,
            city,
            availability,
            description,
            amenities,
            image: imageUrls,
            seller, // user id
            agent: agentId, // user id
            mapUrl,
            vrTourLink
        });
        await product.save();
        res.json({ message: "Product added successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error", error: error, success: false });
    }
};

const listproperty = async (req, res) => {
    try {
        const property = await Property.find()
            .populate('amenities')
            .populate('seller', 'name email') // now User
            .populate('agent', 'name email') // now User
            .populate('city')
            .populate('propertyType');
        res.json({ property, success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeproperty = async (req, res) => {
    try {
        const property = await Property.findById(req.body.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        // Authorization: compare user _id directly
        const isAgent = property.agent && property.agent.toString() === req.user._id.toString();
        const isSeller = property.seller && property.seller.toString() === req.user._id.toString();
        const isAdmin = !!req.admin;
        if (!(isAgent || isSeller || isAdmin)) {
          return res.status(403).json({ message: "You do not have permission to delete this property", success: false });
        }
        await property.deleteOne();
        return res.json({ message: "Property removed successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const updateproperty = async (req, res) => {
    try {
        let { id, title, price, beds, baths, sqft, propertyType, city, availability, description, amenities, seller, mapUrl, status } = req.body;
        // Use propertyType if available, otherwise fall back to type
        const propertyTypeValue = propertyType;
        if (!Array.isArray(amenities)) {
            if (typeof amenities === 'string') {
                amenities = [amenities];
            } else {
                amenities = [];
            }
        }
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        // Authorization: compare user _id directly
        const isAgent = property.agent && property.agent.toString() === req.user._id.toString();
        const isSeller = property.seller && property.seller.toString() === req.user._id.toString();
        const isAdmin = !!req.admin;
        if (!(isAgent || isSeller || isAdmin)) {
          return res.status(403).json({ message: "You do not have permission to update this property", success: false });
        }
        // Handle images: merge existing image URLs and new uploads
        let mergedImages = [];
        if (req.body["existingImages[0]"] !== undefined) {
            // Collect all existing image URLs from the form
            mergedImages = Object.keys(req.body)
                .filter(key => key.startsWith("existingImages["))
                .map(key => req.body[key]);
        }
        // Add new uploaded files
        if (req.files && Object.keys(req.files).length > 0) {
            const newFiles = Object.keys(req.files)
                .filter(key => key.startsWith("image"))
                .map(key => req.files[key][0]);
            const newFileUrls = newFiles.map(item => `/uploads/${item.filename}`);
            mergedImages = [...mergedImages, ...newFileUrls];
        }
        // If no images provided at all, keep the old images
        if (mergedImages.length === 0) {
            mergedImages = property.image;
        }
        property.title = title;
        property.price = price;
        property.beds = beds;
        property.baths = baths;
        property.sqft = sqft;
        property.propertyType = propertyTypeValue;
        property.city = city;
        property.availability = availability;
        property.description = description;
        property.amenities = amenities;
        property.seller = seller; // user id
        if (typeof req.body.agent !== 'undefined') property.agent = req.body.agent === "" ? undefined : req.body.agent; // user id
        property.mapUrl = mapUrl;
        if (status) property.status = status;
        if (req.body.vrTourLink !== undefined) property.vrTourLink = req.body.vrTourLink;
        property.image = mergedImages;
        await property.save();
        return res.json({ message: "Property updated successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const singleproperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id)
            .populate('amenities')
            .populate('seller', 'name email') // now User
            .populate('agent', 'name email') // now User
            .populate('city')
            .populate('propertyType');
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        // Only increment views if not in edit mode
        if (!req.query.edit) {
            property.views = (property.views || 0) + 0.5;
            await property.save();
        }
        res.json({ property, success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};

// Fetch all amenities
const listAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.find();
        res.json({ amenities, success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};

// Seed amenities (one-time use, or protect in production)
const seedAmenities = async (req, res) => {
    const defaultAmenities = [
        "Lake View", "Fireplace", "Central heating and air conditioning", "Dock", "Pool", "Garage", "Garden", "Gym", "Security system", "Master bathroom", "Guest bathroom", "Home theater", "Exercise room/gym", "Covered parking", "High-speed internet ready"
    ];
    try {
        const amenityDocs = await Promise.all(defaultAmenities.map(async (name) => {
            let doc = await Amenity.findOne({ name });
            if (!doc) doc = await Amenity.create({ name });
            return doc;
        }));
        res.json({ amenities: amenityDocs, success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const getTotalPropertyViews = async (req, res) => {
  try {
    const result = await Property.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    res.json({ success: true, totalViews: result[0]?.totalViews || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error calculating total views" });
  }
};

const getViewsOverTime = async (req, res) => {
  try {
    // Get the last 30 days
    const days = 30;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);

    // Aggregate daily views
    const result = await Property.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate }
        }
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          views: 1
        }
      },
      {
        $group: {
          _id: "$day",
          totalViews: { $sum: "$views" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days with 0
    const viewsByDay = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      viewsByDay[key] = 0;
    }
    result.forEach(r => {
      viewsByDay[r._id] = r.totalViews;
    });
    res.json({ success: true, views: viewsByDay });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error getting views over time" });
  }
};

export { addproperty, listproperty, removeproperty, updateproperty , singleproperty, listAmenities, seedAmenities, getTotalPropertyViews, getViewsOverTime };