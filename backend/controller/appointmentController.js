import Property from '../models/propertymodel.js';
import Appointment from '../models/appointmentModel.js';
import User from '../models/Usermodel.js';
import transporter from "../config/nodemailer.js";
import { getSchedulingEmailTemplate, getEmailTemplate } from '../email.js';

async function notifyAppointment({ appointment, property, clientMsg, notifMsg }) {
  if (appointment.userId && appointment.userId._id) {
    await User.findByIdAndUpdate(appointment.userId._id, { $push: { notifications: { type: 'appointment', message: clientMsg, link: '/dashboard/appointments' } } });
  }
  if (property.agent) {
    await User.findByIdAndUpdate(property.agent, { $push: { notifications: { type: 'appointment', message: notifMsg, link: '/appointments' } } }, { new: true });
  }
  if (property.seller) {
    await User.findByIdAndUpdate(property.seller, { $push: { notifications: { type: 'appointment', message: notifMsg, link: '/appointments' } } }, { new: true });
  }
  await User.updateMany({ isAdmin: true }, { $push: { notifications: { type: 'appointment', message: notifMsg, link: '/appointments' } } });
}

function isAllowedAppointment({ req, property }) {
  if (req.admin) return true;
  if (property.agent && property.agent.toString() === req.user._id.toString()) return true;
  if (property.seller && property.seller.toString() === req.user._id.toString()) return true;
  return false;
}

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'propertyId' })
      .populate('userId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!isAllowedAppointment({ req, property: appointment.propertyId })) {
      return res.status(403).json({ success: false, message: 'You do not have permission to change the status of this appointment.' });
    }
    appointment.status = status;
    await appointment.save();
    await appointment.populate('propertyId userId');
    const notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    const clientMsg = `Your appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    await notifyAppointment({ appointment, property: appointment.propertyId, clientMsg, notifMsg });
    res.json({ success: true, message: `Appointment ${status} successfully`, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating appointment' });
  }
};

export const scheduleViewing = async (req, res) => {
  try {
    const { propertyId, date, time, notes, visitType, vrCity } = req.body;
    const userId = req.user._id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    const validVisitTypes = ['property', 'online', 'office_vr'];
    if (!visitType || !validVisitTypes.includes(visitType)) return res.status(400).json({ success: false, message: 'Invalid or missing visit type.' });
    if (visitType === 'office_vr' && (!vrCity || vrCity.trim() === '')) return res.status(400).json({ success: false, message: 'City is required for office VR tour.' });
    const existingAppointment = await Appointment.findOne({ propertyId, date, time, status: { $ne: 'cancelled' } });
    if (existingAppointment) return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    const appointment = new Appointment({ propertyId, userId, date, time, notes, status: 'pending', visitType, vrCity: visitType === 'office_vr' ? vrCity : undefined });
    await appointment.save();
    await appointment.populate(['propertyId', 'userId']);
    const notifMsg = `New appointment requested for property "${property.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} by ${appointment.userId.name}.`;
    const clientMsg = `Your appointment for property "${property.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been requested.`;
    await notifyAppointment({ appointment, property, clientMsg, notifMsg });
    res.status(201).json({ success: true, message: 'Viewing scheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error scheduling viewing' });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'propertyId' })
      .populate('userId', 'email name notifications');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!appointment.userId || !appointment.userId._id || !req.user || !req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment (missing user info)' });
    }
    if (appointment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }
    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || 'Cancelled by user';
    await appointment.save();
    const notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was cancelled. Reason: ${appointment.cancelReason}`;
    const clientMsg = `Your appointment for "${appointment.propertyId.title}" was cancelled. Reason: ${appointment.cancelReason}`;
    await notifyAppointment({ appointment, property: appointment.propertyId, clientMsg, notifMsg });
    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling appointment', error: error.message });
  }
};

export const updateAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId, propertyId, date, time, notes, visitType, vrCity, meetingPlatform, meetingLink, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { propertyId, date, time, notes, visitType, vrCity: visitType === 'office_vr' ? vrCity : undefined, meetingPlatform, meetingLink, status },
      { new: true }
    ).populate({ path: 'propertyId' }).populate('userId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!isAllowedAppointment({ req, property: appointment.propertyId })) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this appointment.' });
    }
    const notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    const clientMsg = `Your appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    await notifyAppointment({ appointment, property: appointment.propertyId, clientMsg, notifMsg });
    res.json({ success: true, message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating appointment details' });
  }
};

export const getAppointmentsByUser = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('propertyId', 'title location image')
      .sort({ date: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
};

export const updateAppointmentMeetingLink = async (req, res) => {
  try {
    const { appointmentId, meetingLink } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { meetingLink },
      { new: true }
    ).populate('propertyId userId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.userId.email,
      subject: "Meeting Link Updated - Aurora",
      html: `<div style="max-width: 600px; margin: 20px auto; font-family: 'Arial', sans-serif; line-height: 1.6;"><div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 40px 20px; border-radius: 15px 15px 0 0; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Meeting Link Updated</h1></div><div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);"><p>Your viewing appointment for <strong>${appointment.propertyId.title}</strong> has been updated with a meeting link.</p><p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p><p><strong>Time:</strong> ${appointment.time}</p><div style="text-align: center; margin: 30px 0;"><a href="${meetingLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Join Meeting</a></div></div></div>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Meeting link updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating meeting link' });
  }
};

export const getAppointmentStats = async (req, res) => {
  try {
    const [pending, confirmed, cancelled, completed] = await Promise.all([
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ status: 'completed' })
    ]);
    const dailyStats = await Appointment.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);
    res.json({ success: true, stats: { total: pending + confirmed + cancelled + completed, pending, confirmed, cancelled, completed, dailyStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointment stats' });
  }
};

export const submitAppointmentFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit feedback for this appointment' });
    }
    appointment.feedback = { rating, comment };
    appointment.status = 'completed';
    await appointment.save();
    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting feedback' });
  }
};

export const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({ userId: req.user._id, date: { $gte: now }, status: { $in: ['pending', 'confirmed'] } })
    .populate('propertyId', 'title location image')
    .sort({ date: 1, time: 1 })
    .limit(5);
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching upcoming appointments' });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'propertyId',
        populate: [
          { path: 'agent', select: 'name email' },
          { path: 'seller', select: 'name email' }
        ]
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
};