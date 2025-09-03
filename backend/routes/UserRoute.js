import express from 'express';
import { login, register, forgotpassword,adminlogin,resetpassword,getname, createUserWithRole, updateUserProfile, getUserRoles, getAllUsersWithRoles, updateUserWithRole, deleteUser, saveLastSearch, getLastSearch, getWishlist, addToWishlist, removeFromWishlist, getNotifications, markNotificationsRead } from '../controller/Usercontroller.js';
import authMiddleware, { adminAuth, rolesOrAdmin } from '../middleware/authmiddleware.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', authMiddleware, getname);
userrouter.post('/create-with-role', adminAuth, createUserWithRole);
userrouter.put('/update-with-role', adminAuth, updateUserWithRole);
userrouter.delete('/:id', adminAuth, deleteUser);

// Multi-role functionality
userrouter.put('/profile', authMiddleware, updateUserProfile);
userrouter.get('/roles', authMiddleware, getUserRoles);
userrouter.get('/all-with-roles', rolesOrAdmin(['agent']), getAllUsersWithRoles);
userrouter.post('/last-search', authMiddleware, saveLastSearch);
userrouter.get('/last-search', authMiddleware, getLastSearch);
userrouter.get('/wishlist', authMiddleware, getWishlist);
userrouter.post('/wishlist/add', authMiddleware, addToWishlist);
userrouter.post('/wishlist/remove', authMiddleware, removeFromWishlist);
userrouter.get('/notifications', authMiddleware, getNotifications);
userrouter.put('/notifications/read', authMiddleware, markNotificationsRead);
userrouter.delete('/notifications', authMiddleware, (req, res) => {
  // Clear all notifications for the logged-in user
  try {
    const user = req.user;
    user.notifications = [];
    user.save();
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

export default userrouter;