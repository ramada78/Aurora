import express from "express";
import { protect, rolesOrAdmin } from '../middleware/authmiddleware.js';
import {
  scheduleViewing,
  getAllAppointments,
  updateAppointmentStatus,
  getAppointmentsByUser,
  cancelAppointment,
  updateAppointmentMeetingLink,
  getAppointmentStats,
  submitAppointmentFeedback,
  getUpcomingAppointments,
  updateAppointmentDetails
} from "../controller/appointmentController.js";


const router = express.Router();

// User routes
router.post("/schedule", protect, scheduleViewing);  // Add protect middleware
router.get("/user", protect, getAppointmentsByUser);
router.put("/cancel/:id", protect, cancelAppointment);
router.put("/feedback/:id", submitAppointmentFeedback);
router.get("/upcoming", getUpcomingAppointments);

// Admin routes
router.get("/all", rolesOrAdmin(['agent']), getAllAppointments);
router.get("/stats", rolesOrAdmin(['agent']), getAppointmentStats);
router.put("/status", rolesOrAdmin(['agent']), updateAppointmentStatus);
router.put("/update-meeting", rolesOrAdmin(['agent']), updateAppointmentMeetingLink);
router.put("/update-details", rolesOrAdmin(['agent']), updateAppointmentDetails);

export default router;