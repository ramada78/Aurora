import express from 'express';
import { listCities, addCity, updateCity, deleteCity } from '../controller/cityController.js';

const router = express.Router();

router.get('/', listCities);
router.post('/', addCity);
router.put('/:id', updateCity);
router.delete('/:id', deleteCity);

export default router; 