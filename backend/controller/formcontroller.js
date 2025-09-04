import Form from '../models/formmodel.js';
import transporter from '../config/nodemailer.js';
import mongoose from 'mongoose';

// Email template for form replies
const getFormReplyTemplate = (formName, adminMessage, originalMessage) => {
  return `
    <div style="max-width: 600px; margin: 20px auto; font-family: Arial, sans-serif;">
      <h1 style="color: #2563eb;">Reply to Your Message</h1>
      <p>Hello <strong>${formName || 'User'}</strong>,</p>
      <p>Thank you for contacting us. Here is our response:</p>
      <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Your original message:</strong></p>
        <p style="font-style: italic;">${originalMessage || 'No original message'}</p>
        <p><strong>Our response:</strong></p>
        <p>${adminMessage || 'No reply message'}</p>
      </div>
      <p>If you need further assistance, please contact us at support@aurora.com</p>
      <p>Best regards,<br>Aurora Support Team</p>
    </div>
  `;
};

// Submit a new form (public endpoint)
export const submitForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newForm = new Form({
      name,
      email,
      phone,
      message
    });

    const savedForm = await newForm.save();
    
    res.json({ 
      success: true,
      message: 'Form submitted successfully',
      formId: savedForm._id
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get all forms with filtering and pagination (admin only)
export const getAllForms = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    
    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const forms = await Form.find(query)
      .populate('assignedTo', 'name email')
      .populate('replies.repliedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      success: true,
      forms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get a single form by ID (admin only)
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await Form.findById(id)
      .populate('assignedTo', 'name email')
      .populate('replies.repliedBy', 'name email');

    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    res.json({
      success: true,
      form
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Update form status, priority, assignment, etc. (admin only)
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, tags, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;
    if (notes !== undefined) updateData.notes = notes;

    const form = await Form.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    res.json({
      success: true,
      message: 'Form updated successfully',
      form
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Add a reply to a form (admin only)
export const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Check if user is authenticated (admin middleware sets req.admin)
    if (!req.admin || (!req.admin.id && !req.admin.email)) {
      return res.status(401).json({ 
        success: false,
        message: 'Admin authentication required' 
      });
    }
    
    // Use admin ID if available, otherwise create a mock ObjectId for email-based admin
    const repliedBy = req.admin.id || new mongoose.Types.ObjectId();

    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'Form ID is required' 
      });
    }

    if (!message) {
      return res.status(400).json({ 
        success: false,
        message: 'Reply message is required' 
      });
    }

    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    // Add reply to form
    const newReply = {
      message,
      repliedBy,
      repliedAt: new Date()
    };

    form.replies.push(newReply);

    // Update status to replied if it's not already
    if (form.status !== 'replied') {
      form.status = 'replied';
    }

    await form.save();

    // Send email reply to the form submitter (optional - don't fail if email fails)
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const emailHtml = getFormReplyTemplate(form.name, message, form.message);

        const mailOptions = {
          from: process.env.SMTP_USER,
          to: form.email,
          subject: `Re: Your Message - Aurora Support`,
          html: emailHtml
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.error('Error sending reply email:', emailError.message);
      // Don't fail the request if email fails, just log the error
    }

    const updatedForm = await Form.findById(id)
      .populate('assignedTo', 'name email')
      .populate('replies.repliedBy', 'name email');

    res.json({
      success: true,
      message: 'Reply added successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Error adding reply:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a form (admin only)
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findByIdAndDelete(id);
    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get form statistics (admin only)
export const getFormStats = async (req, res) => {
  try {
    const stats = await Form.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    const monthlyStats = await Form.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        total: 0,
        new: 0,
        read: 0,
        replied: 0,
        closed: 0,
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching form stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};