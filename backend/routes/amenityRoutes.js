import express from 'express';
import { 
  listAmenities, 
  addAmenity, 
  updateAmenity, 
  deleteAmenity, 
  getAmenityById 
} from '../controller/amenityController.js';

const router = express.Router();

// GET /api/amenities - List all amenities
router.get('/', listAmenities);

// GET /api/amenities/:id - Get amenity by ID
router.get('/:id', getAmenityById);

// POST /api/amenities - Add new amenity
router.post('/', addAmenity);

// PUT /api/amenities/:id - Update amenity
router.put('/:id', updateAmenity);

// DELETE /api/amenities/:id - Delete amenity
router.delete('/:id', deleteAmenity);

export default router; 