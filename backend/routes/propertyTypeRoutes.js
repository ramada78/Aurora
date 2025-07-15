import express from 'express';
import { listPropertyTypes, addPropertyType, updatePropertyType, deletePropertyType, getPropertyTypeCounts } from '../controller/propertyTypeController.js';

const router = express.Router();

router.get('/', listPropertyTypes);
router.post('/', addPropertyType);
router.put('/:id', updatePropertyType);
router.delete('/:id', deletePropertyType);
router.get('/counts', getPropertyTypeCounts);

export default router; 