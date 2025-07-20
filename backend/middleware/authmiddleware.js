import jwt from "jsonwebtoken";
import userModel from "../models/Usermodel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

// Admin middleware for admin-specific routes
export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if this is an admin token (contains email instead of id)
    if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
      req.admin = { email: decoded.email };
      next();
    } else if (decoded.id) {
      // Check for database user with isAdmin: true
      const user = await userModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
      
      if (user.isAdmin) {
        req.admin = { id: user._id, email: user.email };
        req.user = user;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: "Admin access required",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Admin access required",
      });
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

// Role or Admin middleware
export const rolesOrAdmin = (allowedRoles = []) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Please login to continue" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Main admin always allowed
    if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
      req.admin = { email: decoded.email };
      return next();
    }
    
    // Check for database user with isAdmin: true
    if (decoded.id) {
      const user = await userModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      
      // If user has isAdmin: true, allow access
      if (user.isAdmin) {
        req.admin = { id: user._id, email: user.email };
        req.user = user;
        return next();
      }
      
      // Otherwise, check user roles
      const hasRole = user.roles.some(role => allowedRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ success: false, message: "You do not have permission to access this resource" });
      }
      req.user = user;
      next();
    } else {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (error) {
    console.error("Role or admin auth error:", error);
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

// In backend/middleware/authmiddleware.js
export const checkAppointmentOwnership = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this appointment",
      });
    }

    req.appointment = appointment;
    next();
  } catch (error) {
    console.error("Error checking appointment ownership:", error);
    res.status(500).json({
      success: false,
      message: "Error checking appointment ownership",
    });
  }
};

export default protect;
