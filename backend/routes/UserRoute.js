import express from 'express';
import { login, register, forgotpassword,adminlogin,resetpassword,getname, createUserWithRole, switchPrimaryRole, updateUserProfile, getUserRoles, getAllUsersWithRoles, testRegister, updateUserWithRole, deleteUser } from '../controller/Usercontroller.js';
import authMiddleware, { adminAuth, rolesOrAdmin } from '../middleware/authmiddleware.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
userrouter.post('/test-register', testRegister); // Test route
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', authMiddleware, getname);
userrouter.post('/create-with-role', adminAuth, createUserWithRole);
userrouter.put('/update-with-role', adminAuth, updateUserWithRole);
userrouter.delete('/:id', adminAuth, deleteUser);

// Multi-role functionality
userrouter.post('/switch-role', authMiddleware, switchPrimaryRole);
userrouter.put('/profile', authMiddleware, updateUserProfile);
userrouter.get('/roles', authMiddleware, getUserRoles);
userrouter.get('/all-with-roles', rolesOrAdmin(['agent']), getAllUsersWithRoles);

export default userrouter;