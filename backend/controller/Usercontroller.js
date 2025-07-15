import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getWelcomeTemplate } from "../email.js";
import { getPasswordResetTemplate } from "../email.js";

const backendurl = process.env.BACKEND_URL;

const createtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Registeruser = await userModel.findOne({ email });
    if (!Registeruser) {
      return res.json({ message: "Email not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, Registeruser.password);
    if (isMatch) {
      const token = createtoken(Registeruser._id);
      return res.json({ token, user: { _id: Registeruser._id, name: Registeruser.name, email: Registeruser.email, roles: Registeruser.roles }, success: true });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, roles = ['client'], primaryRole = 'client' } = req.body;
    
    console.log('Registration received:', { name, email, roles, primaryRole });
    
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }

    // Validate roles
    const validRoles = ['client', 'agent', 'seller'];
    const selectedRoles = Array.isArray(roles) ? roles : [roles];
    
    for (const role of selectedRoles) {
      if (!validRoles.includes(role)) {
        return res.json({ message: `Invalid role: ${role}`, success: false });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with roles
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      roles: selectedRoles,
      profileCompleted: true
    });
    
    await newUser.save();
    console.log('User saved successfully:', newUser._id);

    // Try to create role-specific records, but don't fail if they don't work
    try {
      for (const role of selectedRoles) {
        if (role === 'client') {
          const Client = (await import('../models/Client.js')).default;
          const clientRecord = new Client({
            user_id: newUser._id,
            phone_number: ''
          });
          await clientRecord.save();
          console.log('Client record created');
        } else if (role === 'agent') {
          const Agent = (await import('../models/Agent.js')).default;
          const agentRecord = new Agent({
            user_id: newUser._id,
            phone_number: ''
          });
          await agentRecord.save();
          console.log('Agent record created');
        } else if (role === 'seller') {
          const Seller = (await import('../models/Seller.js')).default;
          const sellerRecord = new Seller({
            full_name: name,
            email: email,
            phone_number: ''
          });
          await sellerRecord.save();
          console.log('Seller record created');
        }
      }
    } catch (roleError) {
      console.error('Role record creation failed:', roleError);
      // Don't fail the registration if role records fail
    }

    const token = createtoken(newUser._id);

    // Try to send welcome email, but don't fail if email fails
    try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
        subject: "Welcome to Aurora - Your Multi-Role Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Aurora!</h2>
            <p>Hello ${name},</p>
            <p>Your account has been created successfully with the following roles:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Account Roles:</h3>
              <ul style="list-style: none; padding: 0;">
                ${selectedRoles.map(role => `
                  <li style="margin: 8px 0; padding: 8px 12px; background: white; border-radius: 6px; border-left: 4px solid #2563eb;">
                    <strong>${role.charAt(0).toUpperCase() + role.slice(1)}</strong>
                  </li>
                `).join('')}
              </ul>
            </div>
            <p>You can switch between roles in your dashboard and access different features based on your selected role.</p>
            <p>Best regards,<br>The Aurora Team</p>
          </div>
        `
    };

    await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    console.log('Registration completed successfully');

    return res.json({ 
      token, 
      user: { 
        name: newUser.name, 
        email: newUser.email,
        roles: newUser.roles,
      }, 
      success: true 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for specific error types
    if (error.code === 11000) {
      return res.json({ message: "Email already exists", success: false });
    }
    
    return res.json({ message: "Server error during registration", success: false });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset - Aurora Security",
      html: getPasswordResetTemplate(resetUrl)
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, user: { email, isAdmin: true }, success: true });
    } else {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// New function for admin to create users with roles
const createUserWithRole = async (req, res) => {
  try {
    const { name, email, phone_number, roles, password } = req.body;

    // Validate required fields
    if (!name || !email || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ 
        message: "Name, email, and at least one role are required", 
        success: false 
      });
    }

    // Use roles array, primaryRole is first role
    const selectedRoles = roles;
    const primaryRole = roles[0];

    // Validate roles
    const validRoles = ['client', 'agent', 'seller'];
    for (const r of selectedRoles) {
      if (!validRoles.includes(r)) {
        return res.status(400).json({ 
          message: `Invalid role: ${r}`, 
          success: false 
        });
      }
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this email already exists", 
        success: false 
      });
    }

    // Generate a random password or use provided password
    let generatedPassword = password;
    if (!generatedPassword) {
      generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    }
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create the user with roles
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      roles: selectedRoles,
      profileCompleted: true
    });
    await newUser.save();

    // Create role-specific records for all selected roles
    for (const roleType of selectedRoles) {
      if (roleType === 'client') {
        const Client = (await import('../models/Client.js')).default;
        const clientRecord = new Client({
          user_id: newUser._id,
          phone_number: phone_number || ''
        });
        await clientRecord.save();
      } else if (roleType === 'agent') {
        const Agent = (await import('../models/Agent.js')).default;
        const agentRecord = new Agent({
          user_id: newUser._id,
          phone_number: phone_number || ''
        });
        await agentRecord.save();
      } else if (roleType === 'seller') {
        const Seller = (await import('../models/Seller.js')).default;
        const sellerRecord = new Seller({
          full_name: name,
          email,
          phone_number: phone_number || ''
        });
        await sellerRecord.save();
      }
    }

    // Try to send welcome email with credentials, but don't fail if email fails
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `Welcome to Aurora - Your ${primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)} Account`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Aurora!</h2>
            <p>Hello ${name},</p>
            <p>Your account has been created successfully by the administrator.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${req.body.password ? 'Set by admin' : generatedPassword}</p>
              <p><strong>Primary Role:</strong> ${primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)}</p>
              ${selectedRoles.length > 1 ? `<p><strong>All Roles:</strong> ${selectedRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}</p>` : ''}
            </div>
            <p><strong>Important:</strong> Please change your password after your first login for security.</p>
            <p>You can now log in to your account and start using our services.</p>
            <p>Best regards,<br>The Aurora Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the user creation if email fails
    }

    res.status(201).json({ 
      success: true, 
      message: `User created successfully with ${selectedRoles.length > 1 ? 'multiple roles' : primaryRole + ' role'}`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
      }
    });

  } catch (error) {
    console.error('Error creating user with role:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "User with this email already exists", 
        success: false 
      });
    }
    res.status(500).json({ 
      message: "Server error while creating user", 
      success: false,
      error: error.message 
    });
  }
};

const logout = async (req, res) => {
    try {
        return res.json({ message: "Logged out", success: true });
    } catch (error) {
        console.error(error);
        return res.json({ message: "Server error", success: false });
    }
};

// get name and email

const getname = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    return res.json(user);
  }
  catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
}

// Function to switch primary role
const switchPrimaryRole = async (req, res) => {
  try {
    const { primaryRole } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if user has this role
    if (!user.roles.includes(primaryRole)) {
      return res.status(400).json({ 
        message: `You don't have the ${primaryRole} role`, 
        success: false 
      });
    }

    user.primaryRole = primaryRole;
    await user.save();

    res.json({ 
      success: true, 
      message: `Primary role switched to ${primaryRole}`,
      user: {
        name: user.name,
        email: user.email,
        roles: user.roles,
        primaryRole: user.primaryRole
      }
    });

  } catch (error) {
    console.error('Error switching primary role:', error);
    res.status(500).json({ 
      message: "Server error while switching role", 
      success: false 
    });
  }
};

// Function to update user profile with phone numbers
const updateUserProfile = async (req, res) => {
  try {
    const { phoneNumbers } = req.body; // { client: "123", agent: "456", seller: "789" }
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Update phone numbers for each role
    for (const [role, phoneNumber] of Object.entries(phoneNumbers)) {
      if (user.roles.includes(role) && phoneNumber) {
        if (role === 'client') {
          const Client = (await import('../models/Client.js')).default;
          await Client.findOneAndUpdate(
            { user_id: userId },
            { phone_number: phoneNumber },
            { upsert: true }
          );
        } else if (role === 'agent') {
          const Agent = (await import('../models/Agent.js')).default;
          await Agent.findOneAndUpdate(
            { user_id: userId },
            { phone_number: phoneNumber },
            { upsert: true }
          );
        } else if (role === 'seller') {
          const Seller = (await import('../models/Seller.js')).default;
          await Seller.findOneAndUpdate(
            { email: user.email },
            { phone_number: phoneNumber },
            { upsert: true }
          );
        }
      }
    }

    res.json({ 
      success: true, 
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      message: "Server error while updating profile", 
      success: false 
    });
  }
};

// Function to get user's role information
const getUserRoles = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Get role-specific records
    const roleData = {};
    
    if (user.roles.includes('client')) {
      const Client = (await import('../models/Client.js')).default;
      const clientRecord = await Client.findOne({ user_id: userId });
      roleData.client = clientRecord;
    }
    
    if (user.roles.includes('agent')) {
      const Agent = (await import('../models/Agent.js')).default;
      const agentRecord = await Agent.findOne({ user_id: userId });
      roleData.agent = agentRecord;
    }
    
    if (user.roles.includes('seller')) {
      const Seller = (await import('../models/Seller.js')).default;
      const sellerRecord = await Seller.findOne({ email: user.email });
      roleData.seller = sellerRecord;
    }

    res.json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        roles: user.roles,
        primaryRole: user.primaryRole,
        profileCompleted: user.profileCompleted
      },
      roleData
    });

  } catch (error) {
    console.error('Error getting user roles:', error);
    res.status(500).json({ 
      message: "Server error while getting user roles", 
      success: false 
    });
  }
};

// Function to get all users with roles for admin panel
const getAllUsersWithRoles = async (req, res) => {
  try {
    // Get all users with their roles
    const users = await userModel.find().select('-password');

    // Get role-specific data for each user and merge into one object per user
    const usersWithRoleData = await Promise.all(users.map(async (user) => {
      // No need to fetch role-specific phone numbers for display
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        primaryRole: user.primaryRole,
        phone: user.phone || user.phone_number || '',
        status: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }));

    res.json({ 
      success: true, 
      users: usersWithRoleData
    });

  } catch (error) {
    console.error('Error getting all users with roles:', error);
    res.status(500).json({ 
      message: "Server error while getting users", 
      success: false 
    });
  }
};

// Simple test registration function
const testRegister = async (req, res) => {
  try {
    const { name, email, password, roles = ['client'], primaryRole = 'client' } = req.body;
    
    console.log('Test registration received:', { name, email, roles, primaryRole });
    
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with roles
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      roles: Array.isArray(roles) ? roles : [roles],
      primaryRole: primaryRole,
      profileCompleted: true
    });
    
    await newUser.save();
    console.log('User saved successfully:', newUser._id);

    const token = createtoken(newUser._id);

    return res.json({ 
      token, 
      user: { 
        name: newUser.name, 
        email: newUser.email,
        roles: newUser.roles,
        primaryRole: newUser.primaryRole
      }, 
      success: true,
      message: "Test registration successful"
    });
  } catch (error) {
    console.error('Test registration error:', error);
    
    if (error.code === 11000) {
      return res.json({ message: "Email already exists", success: false });
    }
    
    return res.json({ message: "Server error during test registration", success: false });
  }
};

// Function to update user with roles for admin panel
const updateUserWithRole = async (req, res) => {
  try {
    const { userId, name, email, phone_number, roles, password } = req.body;

    // Validate required fields
    if (!userId || !name || !email || !roles) {
      return res.status(400).json({ 
        message: "User ID, name, email, and roles are required", 
        success: false 
      });
    }

    // Validate roles
    const validRoles = ['client', 'agent', 'seller'];
    const selectedRoles = Array.isArray(roles) ? roles : [roles];
    for (const role of selectedRoles) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: `Invalid role: ${role}`, 
          success: false 
        });
      }
    }

    // Find and update the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        success: false 
      });
    }

    // Update user basic info
    user.name = name;
    user.email = email;
    user.roles = selectedRoles;
    user.phone = phone_number || '';
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    // Update or create role-specific records
    for (const role of selectedRoles) {
      if (role === 'client') {
        const Client = (await import('../models/Client.js')).default;
        await Client.findOneAndUpdate(
          { user_id: userId },
          { phone_number: phone_number || '' },
          { upsert: true }
        );
      } else if (role === 'agent') {
        const Agent = (await import('../models/Agent.js')).default;
        await Agent.findOneAndUpdate(
          { user_id: userId },
          { phone_number: phone_number || '' },
          { upsert: true }
        );
      } else if (role === 'seller') {
        const Seller = (await import('../models/Seller.js')).default;
        await Seller.findOneAndUpdate(
          { email: email },
          { 
            full_name: name,
            email: email,
            phone_number: phone_number || ''
          },
          { upsert: true }
        );
      }
    }

    res.json({ 
      success: true, 
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      }
    });

  } catch (error) {
    console.error('Error updating user with role:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Email already exists", 
        success: false 
      });
    }
    
    res.status(500).json({ 
      message: "Server error while updating user", 
      success: false,
      error: error.message 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export { login, register, forgotpassword, resetpassword, adminlogin, logout, getname, createUserWithRole, switchPrimaryRole, updateUserProfile, getUserRoles, getAllUsersWithRoles, testRegister, updateUserWithRole, deleteUser };