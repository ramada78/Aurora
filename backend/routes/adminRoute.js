import express from 'express';
import { adminAuth } from '../middleware/authmiddleware.js';
import { 
  getAdminStats,
  getAllAppointments,
  updateAppointmentStatus 
} from '../controller/adminController.js';
import {
  updateAppointmentMeetingLink,
  updateAppointmentDetails
} from '../controller/appointmentController.js';
import {
  getAllUsersWithRoles,
  createUserWithRole,
  updateUserWithRole,
  deleteUser
} from '../controller/Usercontroller.js';

const router = express.Router();

// Apply adminAuth middleware to all admin routes
router.use(adminAuth);

// Stats
router.get('/stats', getAdminStats);

// Appointments
router.get('/appointments',getAllAppointments);
router.put('/appointments/status',updateAppointmentStatus);
router.put('/appointments/update-meeting', updateAppointmentMeetingLink);
router.put('/appointments/update-details', updateAppointmentDetails);

// User Management
router.get('/users', getAllUsersWithRoles);
router.post('/users', createUserWithRole);
router.put('/users/:id', updateUserWithRole);
router.delete('/users/:id', deleteUser);

export default router;