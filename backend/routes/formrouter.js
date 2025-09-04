import express from 'express';
import { 
  submitForm, 
  getAllForms, 
  getFormById, 
  updateForm, 
  addReply, 
  deleteForm, 
  getFormStats
} from '../controller/formcontroller.js';
import { adminAuth } from '../middleware/authmiddleware.js';

const router = express.Router();

// Public routes
router.post('/submit', submitForm);

// Admin routes (protected)
router.get('/admin', adminAuth, getAllForms);
router.get('/admin/stats', adminAuth, getFormStats);
router.get('/admin/:id', adminAuth, getFormById);
router.put('/admin/:id', adminAuth, updateForm);
router.post('/admin/:id/reply', adminAuth, addReply);
router.delete('/admin/:id', adminAuth, deleteForm);

export default router;