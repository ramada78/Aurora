import firecrawlService from '../services/firecrawlService.js';
import aiService from '../services/aiService.js';
import Property from '../models/propertymodel.js';
import PropertyType from '../models/PropertyType.js';
import City from '../models/City.js';
import * as tf from '@tensorflow/tfjs';

// Helper: Encode categorical fields to numbers
const encodeCategories = (items) => {
    const map = {};
    let idx = 0;
    items.forEach(item => {
        if (!(item in map)) {
            map[item] = idx++;
        }
    });
    return map;
};

export const searchProperties = async (req, res) => {
    try {
        const { city, maxPrice, propertyCategory, propertyType, limit = 6 } = req.body;

        if (!city || !maxPrice) {
            return res.status(400).json({ success: false, message: 'City and maxPrice are required' });
        }

        // Extract property data using Firecrawl, specifying the limit
        const propertiesData = await firecrawlService.findProperties(
            city, 
            maxPrice, 
            propertyCategory || 'Residential',
            propertyType || 'Flat',
            Math.min(limit, 6) // Limit to max 6 properties
        );

        // Analyze the properties using AI
        const analysis = await aiService.analyzeProperties(
            propertiesData.properties,
            city,
            maxPrice,
            propertyCategory || 'Residential',
            propertyType || 'Flat'
        );

        res.json({
            success: true,
            properties: propertiesData.properties,
            analysis
        });
    } catch (error) {
        console.error('Error searching properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to search properties',
            error: error.message
        });
    }
};

export const getLocationTrends = async (req, res) => {
    try {
        const { city } = req.params;
        const { limit = 5 } = req.query;

        if (!city) {
            return res.status(400).json({ success: false, message: 'City parameter is required' });
        }

        // Extract location trend data using Firecrawl, with limit
        const locationsData = await firecrawlService.getLocationTrends(city, Math.min(limit, 5));

        // Analyze the location trends using AI
        const analysis = await aiService.analyzeLocationTrends(
            locationsData.locations,
            city
        );

        res.json({
            success: true,
            locations: locationsData.locations,
            analysis
        });
    } catch (error) {
        console.error('Error getting location trends:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get location trends',
            error: error.message
        });
    }
};

// AI-powered property recommendation endpoint
export const recommendProperties = async (req, res) => {
    try {
        const { beds, price, sqft, propertyType, city, topN = 5 } = req.body;
        // Validate and provide defaults
        const safeBeds = typeof beds === 'number' && !isNaN(beds) ? beds : 1;
        const safePrice = typeof price === 'number' && !isNaN(price) ? price : 100000;
        const safeSqft = typeof sqft === 'number' && !isNaN(sqft) ? sqft : 100;
        const safePropertyType = propertyType || '';
        const safeCity = city || '';
        // Fetch all properties with populated fields
        let properties = await Property.find({})
            .populate('propertyType')
            .populate('city');

        // Filter by city if provided (robust, case-insensitive, trimmed)
        let filteredProperties = properties;
        if (safeCity && safeCity.trim() !== '') {
            const cityNorm = safeCity.trim().toLowerCase();
            filteredProperties = properties.filter(p => {
                const propCity = p.city?.city_name?.trim().toLowerCase();
                return propCity === cityNorm;
            });
            // If no properties match the city, return empty recommendations
            if (filteredProperties.length === 0) {
                return res.json({ success: true, recommended: [] });
            }
        }

        // Pre-filter by propertyType and availability if present
        let preFilteredProperties = filteredProperties;
        if (safePropertyType && safePropertyType.trim() !== '') {
            preFilteredProperties = preFilteredProperties.filter(p =>
                p.propertyType?.type_name?.trim().toLowerCase() === safePropertyType.trim().toLowerCase()
            );
        }
        if (req.body.availability && req.body.availability.trim() !== '') {
            preFilteredProperties = preFilteredProperties.filter(p =>
                p.availability?.trim().toLowerCase() === req.body.availability.trim().toLowerCase()
            );
        }
        // Add minPrice and maxPrice pre-filtering
        let { minPrice, maxPrice } = req.body;
        if (typeof minPrice === 'number' && !isNaN(minPrice)) {
            preFilteredProperties = preFilteredProperties.filter(p => p.price >= minPrice);
        }
        if (typeof maxPrice === 'number' && !isNaN(maxPrice)) {
            preFilteredProperties = preFilteredProperties.filter(p => p.price <= maxPrice);
        }
        if (preFilteredProperties.length === 0) {
            console.warn('No properties matched the requested propertyType, availability, or price range.');
            return res.json({ success: true, recommended: [] });
        }

        // Prepare lists for encoding
        const propertyTypes = [...new Set(preFilteredProperties.map(p => p.propertyType?.type_name || 'Unknown'))];
        const cities = [...new Set(preFilteredProperties.map(p => p.city?.city_name || 'Unknown'))];
        const availabilities = [...new Set(preFilteredProperties.map(p => p.availability || 'Unknown'))];
        const propertyTypeMap = encodeCategories(propertyTypes);
        const cityMap = encodeCategories(cities);
        const availabilityMap = encodeCategories(availabilities);

        // Build feature vectors for all pre-filtered properties
        const featureVectors = preFilteredProperties.map(p => [
            p.beds,
            p.price,
            p.sqft,
            propertyTypeMap[p.propertyType?.type_name || 'Unknown'],
            cityMap[p.city?.city_name || 'Unknown'],
            availabilityMap[p.availability || 'Unknown']
        ]);

        // Build user preference vector
        const userVector = [
            safeBeds,
            safePrice,
            safeSqft,
            propertyTypeMap[safePropertyType],
            cityMap[safeCity],
            availabilityMap[req.body.availability]
        ];
        if ((safePropertyType && propertyTypeMap[safePropertyType] === undefined) || (safeCity && cityMap[safeCity] === undefined) || (req.body.availability && availabilityMap[req.body.availability] === undefined)) {
            console.warn('User preference propertyType, city, or availability not found in mapping. Returning no recommendations.');
            return res.json({ success: true, recommended: [] });
        }

        // Convert to tensors
        const propertyTensor = tf.tensor2d(featureVectors);
        const userTensor = tf.tensor1d(userVector);

        // Compute Euclidean distances
        const diffs = propertyTensor.sub(userTensor);
        const sqDiffs = diffs.square();
        const dists = sqDiffs.sum(1).sqrt();
        const distsArray = await dists.array();

        // Get top N indices
        const sortedIndices = distsArray
            .map((dist, idx) => ({ dist, idx }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, topN)
            .map(obj => obj.idx);

        // Return the top N properties, ensuring all required fields are present
        const backendUrl = process.env.BACKEND_URL || '';
        const recommended = sortedIndices.map(idx => {
            const p = preFilteredProperties[idx];
            let imageUrl = '';
            if (p.image && p.image.length > 0) {
                imageUrl = p.image[0];
                if (imageUrl.startsWith('/uploads/')) {
                    imageUrl = backendUrl.replace(/\/$/, '') + imageUrl;
                }
            }
            return {
                _id: p._id,
                title: p.title || 'No Title',
                price: p.price || 0,
                image: imageUrl,
                beds: p.beds || 0,
                baths: p.baths || 0,
                sqft: p.sqft || 0,
                city: p.city?.city_name || 'Unknown',
                propertyType: p.propertyType?.type_name || 'Unknown',
                availability: p.availability || '',
                description: p.description || '',
                status: p.status || '',
                // Add more fields as needed
            };
        });
        res.json({ success: true, recommended });
    } catch (error) {
        console.error('Error in recommendProperties:', error);
        res.status(500).json({ success: false, message: 'Failed to recommend properties', error: error.message });
    }
};