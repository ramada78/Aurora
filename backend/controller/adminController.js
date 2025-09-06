import Property from "../models/propertymodel.js";
import Appointment from "../models/appointmentModel.js";
import User from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getEmailTemplate } from "../email.js";

const formatRecentProperties = (properties) => {
  return properties.map((property) => ({
    type: "property",
    description: {
      en: `New property listed: ${property.title?.en || property.title || 'Property'}`,
      ar: `تم إدراج عقار جديد: ${property.title?.ar || property.title || 'عقار'}`
    },
    timestamp: property.createdAt,
  }));
};

const formatRecentAppointments = (appointments) => {
  return appointments.map((appointment) => ({
    type: "appointment",
    description: appointment.userId && appointment.propertyId
      ? {
          en: `${appointment.userId.name} scheduled viewing for ${appointment.propertyId.title?.en || appointment.propertyId.title || 'property'}`,
          ar: `${appointment.userId.name} قام بطلب موعد مشاهدة للعقار ${appointment.propertyId.title?.ar || appointment.propertyId.title || 'عقار'}`
        }
      : {
          en: "Appointment scheduled",
          ar: "تم جدولة موعد"
        },
    timestamp: appointment.createdAt,
  }));
};

// Add these helper functions before the existing exports
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      pendingAppointments,
      recentActivity,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      User.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      getRecentActivity(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        pendingAppointments,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
    });
  }
};

const getRecentActivity = async () => {
  try {
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("propertyId", "title")
      .populate("userId", "name");

    // Filter out appointments with missing user or property data
    const validAppointments = recentAppointments.filter(
      (appointment) => appointment.userId && appointment.propertyId
    );

    return [
      ...formatRecentProperties(recentProperties),
      ...formatRecentAppointments(validAppointments),
    ].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
};


// Public stats endpoint for home page (no authentication required)
export const getPublicStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      pendingAppointments,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      User.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        pendingAppointments,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching public statistics",
    });
  }
};

// Add these new controller functions
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("propertyId", "title location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    // Find appointment first for better performance
    const appointment = await Appointment.findById(appointmentId)
      .populate("propertyId userId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    // Get property title for notifications
    const propertyTitle = appointment.propertyId.displayTitle || (appointment.propertyId.title?.en || appointment.propertyId.title) || 'Property';
    const propertyTitleAr = appointment.propertyId.title?.ar || 'العقار';
    
    // Create notification messages
    const notifMsg = {
      en: `Appointment for property "${propertyTitle}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been ${status}.`,
      ar: `تم ${status === 'confirmed' ? 'تأكيد' : status === 'cancelled' ? 'إلغاء' : 'تحديث'} الموعد للعقار "${propertyTitleAr}" في ${new Date(appointment.date).toLocaleDateString('ar-EG')} الساعة ${appointment.time} بنجاح.`
    };
    
    const clientMsg = {
      en: `Your appointment for property "${propertyTitle}" on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been ${status}.`,
      ar: `تم ${status === 'confirmed' ? 'تأكيد' : status === 'cancelled' ? 'إلغاء' : 'تحديث'} موعدك للعقار "${propertyTitleAr}" في ${new Date(appointment.date).toLocaleDateString('ar-EG')} الساعة ${appointment.time} بنجاح.`
    };

    // Create in-app notification for the client
    if (appointment.userId && appointment.userId._id) {
      try {
        const notification = {
          type: 'appointment',
          message: {
            en: clientMsg.en || `Your appointment has been ${status}`,
            ar: clientMsg.ar || `تم ${status === 'confirmed' ? 'تأكيد' : status === 'cancelled' ? 'إلغاء' : 'تحديث'} موعدك بنجاح`
          },
          link: '/dashboard/appointments',
          read: false,
          createdAt: new Date()
        };
        
        await User.findByIdAndUpdate(appointment.userId._id, { 
          $push: { notifications: notification } 
        });
        console.log(`Notification created for user ${appointment.userId._id} for appointment ${appointmentId}`);
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the entire operation if notification creation fails
      }
    }

    // Send response immediately for faster UI update
    const statusMessage = {
      en: `Appointment ${status} successfully`,
      ar: `تم ${status === 'confirmed' ? 'تأكيد' : status === 'cancelled' ? 'إلغاء' : 'تحديث'} الموعد بنجاح`
    };
    
    res.json({
      success: true,
      message: statusMessage.en,
      messageAr: statusMessage.ar,
      appointment,
    });

    // Send email notification asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: appointment.userId.email,
          subject: `Viewing Appointment ${
            status.charAt(0).toUpperCase() + status.slice(1)
          } - Aurora`,
          html: getEmailTemplate(appointment, status),
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${appointment.userId.email} for appointment ${appointmentId}`);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
    });
  }
};
