import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    roles: { 
        type: [String], 
        enum: ['client', 'agent', 'seller'], 
        default: ['client'] 
    },
    // Profile completion status
    profileCompleted: { type: Boolean, default: false },
    // Last 10 search/filter preferences for AI recommendations
    lastSearches: { type: [Object], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    notifications: [{
        type: {
            type: String,
            enum: ['appointment', 'system', 'message', 'other'],
            default: 'system'
        },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        link: { type: String }
    }]
});

const User = mongoose.model('User', UserSchema);

export default User;