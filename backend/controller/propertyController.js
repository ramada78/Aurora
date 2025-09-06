import firecrawlService from '../services/firecrawlService.js';
import aiService from '../services/aiService.js';
import Property from '../models/propertymodel.js';
import PropertyType from '../models/PropertyType.js';
import City from '../models/City.js';

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
        console.log('Recommendation request:', { beds, price, sqft, propertyType, city, topN });
        
        // Validate and provide defaults
        const safeBeds = typeof beds === 'number' && !isNaN(beds) ? beds : 1;
        const safePrice = typeof price === 'number' && !isNaN(price) ? price : 100000;
        const safeSqft = typeof sqft === 'number' && !isNaN(sqft) ? sqft : 100;
        const safePropertyType = propertyType || '';
        const safeCity = city || '';
        
        console.log('Safe values:', { safeBeds, safePrice, safeSqft, safePropertyType, safeCity });
        // Fetch all properties with populated fields
        let properties = await Property.find({})
            .populate('propertyType')
            .populate('city');

        // Filter by city if provided (robust, case-insensitive, trimmed)
        let filteredProperties = properties;
        if (safeCity && safeCity.trim() !== '') {
            const cityNorm = safeCity.trim().toLowerCase();
            filteredProperties = properties.filter(p => {
                // Handle both string and object formats for city_name
                let propCity = '';
                if (typeof p.city?.city_name === 'string') {
                    propCity = p.city.city_name.trim().toLowerCase();
                } else if (typeof p.city?.city_name === 'object') {
                    // Use English name for comparison (since frontend translates to English)
                    propCity = (p.city.city_name.en || '').trim().toLowerCase();
                }
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
            preFilteredProperties = preFilteredProperties.filter(p => {
                // Handle both string and object formats for type_name
                let propType = '';
                if (typeof p.propertyType?.type_name === 'string') {
                    propType = p.propertyType.type_name.trim().toLowerCase();
                } else if (typeof p.propertyType?.type_name === 'object') {
                    // Use English name for comparison (since frontend translates to English)
                    propType = (p.propertyType.type_name.en || '').trim().toLowerCase();
                }
                return propType === safePropertyType.trim().toLowerCase();
            });
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

        // Simple similarity-based recommendation algorithm
        const calculateSimilarity = (property, userPrefs) => {
            let score = 0;
            let factors = 0;

            // Price similarity (closer to user's preferred price = higher score)
            if (userPrefs.price && property.price) {
                const priceDiff = Math.abs(property.price - userPrefs.price);
                const priceScore = Math.max(0, 100 - (priceDiff / userPrefs.price) * 100);
                score += priceScore * 0.3; // 30% weight
                factors += 0.3;
            }

            // Bedrooms similarity
            if (userPrefs.beds && property.beds) {
                const bedsScore = property.beds === userPrefs.beds ? 100 : 
                                 Math.abs(property.beds - userPrefs.beds) === 1 ? 70 : 30;
                score += bedsScore * 0.2; // 20% weight
                factors += 0.2;
            }

            // Property type similarity
            if (userPrefs.propertyType && property.propertyType) {
                const propType = typeof property.propertyType.type_name === 'string' 
                    ? property.propertyType.type_name 
                    : (property.propertyType.type_name?.en || '');
                const typeScore = propType.toLowerCase() === userPrefs.propertyType.toLowerCase() ? 100 : 0;
                score += typeScore * 0.25; // 25% weight
                factors += 0.25;
            }

            // City similarity
            if (userPrefs.city && property.city) {
                const propCity = typeof property.city.city_name === 'string' 
                    ? property.city.city_name 
                    : (property.city.city_name?.en || '');
                const cityScore = propCity.toLowerCase() === userPrefs.city.toLowerCase() ? 100 : 0;
                score += cityScore * 0.15; // 15% weight
                factors += 0.15;
            }

            // Availability similarity
            if (userPrefs.availability && property.availability) {
                const availScore = property.availability.toLowerCase() === userPrefs.availability.toLowerCase() ? 100 : 0;
                score += availScore * 0.1; // 10% weight
                factors += 0.1;
            }

            // Return normalized score
            return factors > 0 ? score / factors : 0;
        };

        // Calculate similarity scores for all properties
        const userPrefs = {
            beds: safeBeds,
            price: safePrice,
            sqft: safeSqft,
            propertyType: safePropertyType,
            city: safeCity,
            availability: req.body.availability
        };

        const scoredProperties = preFilteredProperties.map((property, index) => ({
            property,
            index,
            score: calculateSimilarity(property, userPrefs)
        }));

        // Sort by score and get top N
        const sortedProperties = scoredProperties
            .sort((a, b) => b.score - a.score)
            .slice(0, topN);

        // Return the top N properties, ensuring all required fields are present
        const backendUrl = process.env.BACKEND_URL || '';
        const recommended = sortedProperties.map(({ property: p, score }) => {
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
                city: p.city || null,
                propertyType: p.propertyType || null,
                availability: p.availability || '',
                description: p.description || '',
                status: p.status || '',
                similarityScore: Math.round(score), // Add similarity score for debugging
                // Add more fields as needed
            };
        });
        res.json({ success: true, recommended });
    } catch (error) {
        console.error('Error in recommendProperties:', error);
        res.status(500).json({ success: false, message: 'Failed to recommend properties', error: error.message });
    }
};