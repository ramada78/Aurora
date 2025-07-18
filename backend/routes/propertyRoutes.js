import express from 'express';
import { searchProperties, getLocationTrends, recommendProperties } from '../controller/propertyController.js';

const router = express.Router();

// Route to search for properties
router.post('/properties/search', searchProperties);

// Route to get property recommendations (AI-powered)
router.post('/properties/recommend', recommendProperties);

// Route to get location trends
router.get('/locations/:city/trends', getLocationTrends);

export default router;