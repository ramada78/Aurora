import express from 'express';
import { listPropertyTypes, addPropertyType, updatePropertyType, deletePropertyType } from '../controller/propertyTypeController.js';

const router = express.Router();

router.get('/', listPropertyTypes);
router.post('/', addPropertyType);
router.put('/:id', updatePropertyType);
router.delete('/:id', deletePropertyType);

export default router; 