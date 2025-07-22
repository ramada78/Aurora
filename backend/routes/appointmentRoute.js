import express from "express";
import { protect } from '../middleware/authmiddleware.js';
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

router.post("/schedule", protect, scheduleViewing);
router.get("/user", protect, getAppointmentsByUser);
router.put("/cancel/:id", protect, cancelAppointment);
router.put("/feedback/:id", protect, submitAppointmentFeedback);
router.get("/upcoming", protect, getUpcomingAppointments);
router.get("/all", protect, getAllAppointments);
router.get("/stats", protect, getAppointmentStats);
router.put("/status", protect, updateAppointmentStatus);
router.put("/update-meeting", protect, updateAppointmentMeetingLink);
router.put("/update-details", protect, updateAppointmentDetails);

export default router;