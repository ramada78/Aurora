import express from 'express';
import { addproperty, listproperty, removeproperty, updateproperty,singleproperty, listAmenities, seedAmenities, getTotalPropertyViews, getViewsOverTime, getPropertyStatusDistribution } from '../controller/productcontroller.js';
import upload from '../middleware/multer.js';
import { rolesOrAdmin } from '../middleware/authmiddleware.js';

const propertyrouter = express.Router();

propertyrouter.post('/add', rolesOrAdmin(['agent','seller']), upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), addproperty);
propertyrouter.get('/list', listproperty);
propertyrouter.post('/remove', rolesOrAdmin(['agent','seller']), removeproperty);
propertyrouter.post('/update', rolesOrAdmin(['agent','seller']), upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), updateproperty);
propertyrouter.get('/single/:id', singleproperty);
propertyrouter.get('/amenities', listAmenities);
propertyrouter.post('/amenities/seed', seedAmenities);
propertyrouter.get('/total-views', getTotalPropertyViews);
propertyrouter.get('/views-over-time', getViewsOverTime);
propertyrouter.get('/status-distribution', getPropertyStatusDistribution);

export default propertyrouter;