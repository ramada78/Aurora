import Stats from '../models/statsModel.js';
import Property from '../models/propertymodel.js';
import Appointment from '../models/appointmentModel.js';
import User from '../models/Usermodel.js';
import transporter from "../config/nodemailer.js";
import { getSchedulingEmailTemplate,getEmailTemplate } from '../email.js';

// Format helpers
const formatRecentProperties = (properties) => {
  return properties.map(property => ({
    type: 'property',
    description: `New property listed: ${property.title}`,
    timestamp: property.createdAt
  }));
};

const formatRecentAppointments = (appointments) => {
  return appointments.map(appointment => ({
    type: 'appointment',
    description: `${appointment.userId.name} scheduled viewing for ${appointment.propertyId.title}`,
    timestamp: appointment.createdAt
  }));
};

// Main stats controller
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      pendingAppointments,
      recentActivity,
      viewsData,
      revenue
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'active' }),
      User.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      getRecentActivity(),
      getViewsData(),
      calculateRevenue()
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        pendingAppointments,
        recentActivity,
        viewsData,
        revenue
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
};

// Activity tracker
const getRecentActivity = async () => {
  try {
    const [recentProperties, recentAppointments] = await Promise.all([
      Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt'),
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('propertyId', 'title')
        .populate('userId', 'name')
    ]);

    return [
      ...formatRecentProperties(recentProperties),
      ...formatRecentAppointments(recentAppointments)
    ].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

// Views analytics
const getViewsData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Stats.aggregate([
      {
        $match: {
          endpoint: /^\/api\/products\/single\//,
          method: 'GET',
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      labels.push(dateString);
      
      const stat = stats.find(s => s._id === dateString);
      data.push(stat ? stat.count : 0);
    }

    return {
      labels,
      datasets: [{
        label: 'Property Views',
        data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    return {
      labels: [],
      datasets: [{
        label: 'Property Views',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  }
};

// Revenue calculation
const calculateRevenue = async () => {
  try {
    const properties = await Property.find();
    return properties.reduce((total, property) => total + Number(property.price), 0);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
};

// Appointment management
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'propertyId',
        populate: [
          { path: 'agent', model: 'User' },
          { path: 'seller', model: 'Seller' }
        ]
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    
    // Restrict: Only admin, agent of property, or seller can change status
    const appointment = await Appointment.findById(appointmentId).populate({
      path: 'propertyId',
      populate: [
        { path: 'agent', model: 'User' },
        { path: 'seller', model: 'Seller' }
      ]
    }).populate('userId');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    let allowed = false;
    if (req.admin) {
      allowed = true;
    } else if (appointment.propertyId.agent && appointment.propertyId.agent._id.toString() === req.user._id.toString()) {
      allowed = true;
    } else if (
      appointment.propertyId.seller &&
      req.user.email &&
      appointment.propertyId.seller.email === req.user.email
    ) {
      allowed = true;
    }
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to change the status of this appointment.'
      });
    }
    appointment.status = status;
    await appointment.save();
    await appointment.populate('propertyId userId');

    // In-app notifications for confirmation/edit/cancellation
    let notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    let clientMsg = `Your appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    if (status === 'confirmed') {
      notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been confirmed.`;
      clientMsg = `Your appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been confirmed.`;
    } else if (status === 'cancelled') {
      notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was cancelled.`;
      clientMsg = `Your appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was cancelled.`;
    }
    // Notify client
    await User.findByIdAndUpdate(appointment.userId._id, {
      $push: {
        notifications: {
          type: 'appointment',
          message: clientMsg,
          link: '/dashboard/appointments'
        }
      }
    });
    // Notify agent
    if (appointment.propertyId.agent) {
      await User.findByIdAndUpdate(appointment.propertyId.agent._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    // Notify seller (if seller is a user)
    if (appointment.propertyId.seller && appointment.propertyId.seller._id) {
      await User.findByIdAndUpdate(appointment.propertyId.seller._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    // Notify admin
    await User.updateMany({ isAdmin: true }, { $push: { notifications: { type: 'appointment', message: notifMsg, link: '/appointments' } } });

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment'
    });
  }
};

// Add scheduling functionality
export const scheduleViewing = async (req, res) => {
  try {
    const { propertyId, date, time, notes, visitType, vrCity } = req.body;
    
    // req.user is set by the protect middleware
    

    const userId = req.user._id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Validate visitType
    const validVisitTypes = ['property', 'online', 'office_vr'];
    if (!visitType || !validVisitTypes.includes(visitType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing visit type.'
      });
    }
    // If office_vr, vrCity must be provided
    if (visitType === 'office_vr' && (!vrCity || vrCity.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'City is required for office VR tour.'
      });
    }

    // Check for duplicate appointments
    const existingAppointment = await Appointment.findOne({
      propertyId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const appointment = new Appointment({
      propertyId,
      userId,
      date,
      time,
      notes,
      status: 'pending',
      visitType,
      vrCity: visitType === 'office_vr' ? vrCity : undefined
    });

    await appointment.save();
    await appointment.populate(['propertyId', 'userId']);

    // In-app notifications for scheduling (agent, seller, admin)
    const notifMsg = `New appointment requested for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} by ${appointment.userId.name}.`;
    // Notify agent
    if (appointment.propertyId.agent) {
      await User.findByIdAndUpdate(appointment.propertyId.agent._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    // Notify seller (if seller is a user)
    if (appointment.propertyId.seller && appointment.propertyId.seller._id) {
      await User.findByIdAndUpdate(appointment.propertyId.seller._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    // Notify admin
    await User.updateMany({ isAdmin: true }, { $push: { notifications: { type: 'appointment', message: notifMsg, link: '/appointments' } } });

    // Send confirmation email
    /*
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.user.email,
      subject: "Viewing Scheduled - Aurora",
      html: getSchedulingEmailTemplate(appointment, date, time, notes)
    };
    await transporter.sendMail(mailOptions);
    */

    res.status(201).json({
      success: true,
      message: 'Viewing scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error scheduling viewing:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling viewing'
    });
  }
};

// Add this with other exports
export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'propertyId',
        populate: [
          { path: 'agent', model: 'User' },
          { path: 'seller', model: 'Seller' }
        ]
      })
      .populate('userId', 'email name notifications');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.userId || !appointment.userId._id || !req.user || !req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment (missing user info)'
      });
    }

    if (appointment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || 'Cancelled by user';
    await appointment.save();

    // In-app notifications for cancellation (agent, seller, client, admin)
    const notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was cancelled. Reason: ${appointment.cancelReason}`;
    // Notify user
    await User.findByIdAndUpdate(appointment.userId._id, {
      $push: {
        notifications: {
          type: 'appointment',
          message: `Your appointment for "${appointment.propertyId.title}" was cancelled. Reason: ${appointment.cancelReason}`,
          link: '/dashboard/appointments'
        }
      }
    });
    // Notify agent
    if (appointment.propertyId.agent) {
      await User.findByIdAndUpdate(appointment.propertyId.agent._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    // Notify seller (if seller is a user)
    if (appointment.propertyId.seller && appointment.propertyId.seller._id) {
      await User.findByIdAndUpdate(appointment.propertyId.seller._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    // Notify admin
    await User.updateMany({ isAdmin: true }, { $push: { notifications: { type: 'appointment', message: notifMsg, link: '/appointments' } } });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// Add this function to get user's appointments
export const getAppointmentsByUser = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('propertyId', 'title location image')
      .sort({ date: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
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

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Send email notification with meeting link
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.userId.email,
      subject: "Meeting Link Updated - Aurora",
      html: `
        <div style="max-width: 600px; margin: 20px auto; font-family: 'Arial', sans-serif; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 40px 20px; border-radius: 15px 15px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Meeting Link Updated</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
            <p>Your viewing appointment for <strong>${appointment.propertyId.title}</strong> has been updated with a meeting link.</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meetingLink}" 
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #1e40af); 
                        color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Join Meeting
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Meeting link updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating meeting link:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meeting link'
    });
  }
};

// Update all appointment details
export const updateAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId, propertyId, date, time, notes, visitType, vrCity, meetingPlatform, meetingLink, status } = req.body;

    // Validate visitType
    const validVisitTypes = ['property', 'online', 'office_vr'];
    if (!visitType || !validVisitTypes.includes(visitType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing visit type.'
      });
    }
    if (visitType === 'office_vr' && (!vrCity || vrCity.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'City is required for office VR tour.'
      });
    }

    const updateFields = {
      propertyId,
      date,
      time,
      notes,
      visitType,
      vrCity: visitType === 'office_vr' ? vrCity : undefined,
      meetingPlatform,
      meetingLink,
      status
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateFields,
      { new: true }
    ).populate(['propertyId', 'userId']);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Restrict: Only admin, agent of property, or seller can change status
    if (typeof status !== 'undefined' && appointment.status !== status) {
      let allowed = false;
      if (req.admin) {
        allowed = true;
      } else if (appointment.propertyId.agent && appointment.propertyId.agent._id.toString() === req.user._id.toString()) {
        allowed = true;
      } else if (
        appointment.propertyId.seller &&
        req.user.email &&
        appointment.propertyId.seller.email === req.user.email
      ) {
        allowed = true;
      }
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to change the status of this appointment.'
        });
      }
      appointment.status = status;
    }

    // In-app notifications for appointment editing
    const notifMsg = `Appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    const clientMsg = `Your appointment for property "${appointment.propertyId.title}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been updated.`;
    
    // Notify client
    await User.findByIdAndUpdate(appointment.userId._id, {
      $push: {
        notifications: {
          type: 'appointment',
          message: clientMsg,
          link: '/dashboard/appointments'
        }
      }
    });
    
    // Notify agent
    if (appointment.propertyId.agent) {
      await User.findByIdAndUpdate(appointment.propertyId.agent._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    
    // Notify seller (if seller is a user)
    if (appointment.propertyId.seller && appointment.propertyId.seller._id) {
      await User.findByIdAndUpdate(appointment.propertyId.seller._id, {
        $push: {
          notifications: {
            type: 'appointment',
            message: notifMsg,
            link: '/appointments'
          }
        }
      });
    }
    
    // Notify admin
    await User.updateMany({ isAdmin: true }, { 
      $push: { 
        notifications: { 
          type: 'appointment', 
          message: notifMsg, 
          link: '/appointments' 
        } 
      } 
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment details'
    });
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

    // Get stats by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total: pending + confirmed + cancelled + completed,
        pending,
        confirmed,
        cancelled,
        completed,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment statistics'
    });
  }
};

export const submitAppointmentFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this appointment'
      });
    }

    appointment.feedback = { rating, comment };
    appointment.status = 'completed';
    await appointment.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
};

export const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      userId: req.user._id,
      date: { $gte: now },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('propertyId', 'title location image')
    .sort({ date: 1, time: 1 })
    .limit(5);

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming appointments'
    });
  }
};