import express from 'express';
import { listClients, addClient, updateClient, deleteClient } from '../controller/clientController.js';

const router = express.Router();

router.get('/', listClients);
router.post('/', addClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router; 