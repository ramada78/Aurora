import express from 'express';
import {
  getAllNews,
  getAllNewsForAdmin,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  submitNewsletter
} from '../controller/newscontroller.js';
import { adminAuth } from '../middleware/authmiddleware.js';
import upload from '../middleware/multer.js';

const newsrouter = express.Router();

// Public routes
newsrouter.get('/news', getAllNews);
newsrouter.get('/news/:id', getNewsById);
newsrouter.post('/newsletter', submitNewsletter);

// Protected routes (Admin only)
newsrouter.get('/admin/news', adminAuth, getAllNewsForAdmin);
newsrouter.post('/news', adminAuth, upload.single('image'), createNews);
newsrouter.put('/news/:id', adminAuth, upload.single('image'), updateNews);
newsrouter.delete('/news/:id', adminAuth, deleteNews);

export default newsrouter;