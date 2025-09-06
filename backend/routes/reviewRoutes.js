import express from 'express';
import { listReviews, addReview, updateReview, deleteReview, getReviewsByProperty } from '../controller/reviewController.js';

const router = express.Router();

router.get('/', listReviews);
router.get('/property/:propertyId', getReviewsByProperty);
router.post('/', addReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router; 