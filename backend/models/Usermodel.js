import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    // Track which roles this user has
    roles: { 
        type: [String], 
        enum: ['client', 'agent', 'seller'], 
        default: ['client'] 
    },
    // Profile completion status
    profileCompleted: { type: Boolean, default: false },
    // Last 10 search/filter preferences for AI recommendations
    lastSearches: { type: [Object], default: [] },
    // Last search/filter preferences for AI recommendations
    lastSearch: { type: Object, default: null }
});

const User = mongoose.model('User', UserSchema);

export default User;