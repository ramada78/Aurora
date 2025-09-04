import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  replies: [{
    message: {
      type: String,
      required: true
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    repliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true,
});

// Index for better query performance
formSchema.index({ status: 1, createdAt: -1 });
formSchema.index({ email: 1 });
formSchema.index({ assignedTo: 1 });

const Form = mongoose.model('Form', formSchema);

export default Form;