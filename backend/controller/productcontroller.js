import fs from "fs";
import Property from "../models/propertymodel.js";
import Amenity from "../models/amenityModel.js";

const addproperty = async (req, res) => {
    try {
        let { title, location, price, beds, baths, sqft, type, availability, description, amenities, phone } = req.body;
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
        const product = new Property({
            title,
            location,
            price,
            beds,
            baths,
            sqft,
            type,
            availability,
            description,
            amenities,
            image: imageUrls,
            phone
        });
        await product.save();
        res.json({ message: "Product added successfully", success: true });
    } catch (error) {
        console.log("Error adding product: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const listproperty = async (req, res) => {
    try {
        const property = await Property.find().populate('amenities');
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error listing products: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeproperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.body.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        return res.json({ message: "Property removed successfully", success: true });
    } catch (error) {
        console.log("Error removing product: ", error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

const updateproperty = async (req, res) => {
    try {
        let { id, title, location, price, beds, baths, sqft, type, availability, description, amenities, phone } = req.body;
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
        if (!req.files || Object.keys(req.files).length === 0) {
            property.title = title;
            property.location = location;
            property.price = price;
            property.beds = beds;
            property.baths = baths;
            property.sqft = sqft;
            property.type = type;
            property.availability = availability;
            property.description = description;
            property.amenities = amenities;
            property.phone = phone;
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
        property.location = location;
        property.price = price;
        property.beds = beds;
        property.baths = baths;
        property.sqft = sqft;
        property.type = type;
        property.availability = availability;
        property.description = description;
        property.amenities = amenities;
        property.phone = phone;
        property.image = imageUrls;
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
        const property = await Property.findById(id).populate('amenities');
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
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

export { addproperty, listproperty, removeproperty, updateproperty , singleproperty, listAmenities, seedAmenities };