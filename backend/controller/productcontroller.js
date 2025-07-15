import fs from "fs";
import Property from "../models/propertymodel.js";
import Amenity from "../models/amenityModel.js";

const addproperty = async (req, res) => {
    try {
        let { title, price, beds, baths, sqft, propertyType, city, availability, description, amenities, seller, mapUrl } = req.body;
        if (seller === "") seller = undefined;
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
        // If admin, agent is null; otherwise, use logged-in user's _id
        const agentId = req.user?._id || null;
        const product = new Property({
            title,
            price,
            beds,
            baths,
            sqft,
            propertyType: propertyTypeValue, // Also set propertyType field
            city, // Add city field
            availability,
            description,
            amenities,
            image: imageUrls,
            seller, // Add seller reference
            agent: agentId, // Set agent to logged-in user or null for admin
            mapUrl // Add mapUrl field
        });
        await product.save();
        res.json({ message: "Product added successfully", success: true });
    } catch (error) {
        console.log("Error adding product: ", error);
        res.status(500).json({ message: error.message || "Server Error", error: error, success: false });
    }
};

const listproperty = async (req, res) => {
    try {
        const property = await Property.find().populate('amenities').populate('seller').populate('city').populate('propertyType');
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error listing products: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeproperty = async (req, res) => {
    try {
        const property = await Property.findById(req.body.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        const isAgent = property.agent && (
          (typeof property.agent === 'string' && req.user && property.agent === req.user._id.toString()) ||
          (typeof property.agent === 'object' && property.agent._id && req.user && property.agent._id.toString() === req.user._id.toString())
        );
        const isSeller = property.seller && (
          (typeof property.seller === 'string' && req.user && property.seller === req.user._id.toString()) ||
          (typeof property.seller === 'object' && property.seller._id && req.user && property.seller._id.toString() === req.user._id.toString())
        );
        const isAdmin = !!req.admin;
        if (!(isAgent || isSeller || isAdmin)) {
          return res.status(403).json({ message: "You do not have permission to delete this property", success: false });
        }
        await property.deleteOne();
        return res.json({ message: "Property removed successfully", success: true });
    } catch (error) {
        console.log("Error removing product: ", error);
        return res.status(500).json({ message: "Server Error", success: false });
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
            console.log("Property not found with ID:", id); // Debugging line
            return res.status(404).json({ message: "Property not found", success: false });
        }
        // Ownership checks
        const isAgent = req.user && property.agent && property.agent.toString() === req.user._id.toString();
        const isSeller = req.user && property.seller && property.seller.toString() === req.user._id.toString();
        const isAdmin = !!req.admin;
        if (!(isAgent || isSeller || isAdmin)) {
          return res.status(403).json({ message: "You do not have permission to update this property", success: false });
        }
        if (!req.files || Object.keys(req.files).length === 0) {
            property.title = title;
            property.price = price;
            property.beds = beds;
            property.baths = baths;
            property.sqft = sqft;
            property.propertyType = propertyTypeValue; // Also set propertyType field
            property.city = city; // Add city field
            property.availability = availability;
            property.description = description;
            property.amenities = amenities;
            property.seller = seller; // Add seller field
            property.mapUrl = mapUrl; // Add mapUrl field
            if (status) property.status = status;
            await property.save();
            return res.json({ message: "Property updated successfully", success: true });
        }
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        const imageUrls = images.map(item => `/uploads/${item.filename}`);
        property.title = title;
        property.price = price;
        property.beds = beds;
        property.baths = baths;
        property.sqft = sqft;
        property.propertyType = propertyTypeValue; // Also set propertyType field
        property.city = city; // Add city field
        property.availability = availability;
        property.description = description;
        property.amenities = amenities;
        property.seller = seller;
        property.image = imageUrls;
        property.mapUrl = mapUrl; // Add mapUrl field
        if (status) property.status = status;
        await property.save();
        res.json({ message: "Property updated successfully", success: true });
    } catch (error) {
        console.log("Error updating property: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const singleproperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id).populate('amenities').populate('seller').populate('city').populate('propertyType');
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
        console.log("Error fetching property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

// Fetch all amenities
const listAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.find();
        res.json({ amenities, success: true });
    } catch (error) {
        console.log("Error listing amenities: ", error);
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
        console.log("Error seeding amenities: ", error);
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